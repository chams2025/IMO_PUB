"""Additional API views for SaheLiq platform features."""
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Annonce,
    Conversation,
    Message,
    Notification,
    Report,
    SiteContactMessage,
)
from .permissions import IsSuperAdmin
from .pricing import check_price, estimate_price
from .serializers import (
    AnnonceSerializer,
    CustomTokenObtainPairSerializer,
    ProfileSerializer,
    SiteContactMessageSerializer,
)
from .smart_search_utils import parse_natural_language, score_annonce, visible_annonces_queryset


def _serialize_search_results(results, request):
    data = []
    for item in results:
        annonce_data = AnnonceSerializer(item["annonce"], context={"request": request}).data
        annonce_data["score"] = item["score"]
        annonce_data["why_matched"] = item["why"]
        data.append(annonce_data)
    return data


def _run_smart_search(request, filters, keywords=None):
    queryset = visible_annonces_queryset(request.user if request.user.is_authenticated else None)

    ville = filters.get("ville") or request.query_params.get("ville", "")
    type_bien = filters.get("type_bien") or request.query_params.get("type_bien", "")
    nombre_pieces = filters.get("nombre_pieces") or request.query_params.get("nombre_pieces")
    min_prix = filters.get("min_prix") or request.query_params.get("min_prix")
    max_prix = filters.get("max_prix") or request.query_params.get("max_prix")
    min_superficie = filters.get("min_superficie") or request.query_params.get("min_superficie")
    max_superficie = filters.get("max_superficie") or request.query_params.get("max_superficie")

    if ville:
        queryset = queryset.filter(ville__icontains=ville)
    if type_bien:
        queryset = queryset.filter(type_bien__icontains=type_bien)
    if nombre_pieces:
        try:
            queryset = queryset.filter(nombre_pieces=int(nombre_pieces))
        except ValueError:
            pass
    if min_prix:
        queryset = queryset.filter(prix__gte=min_prix)
    if max_prix:
        queryset = queryset.filter(prix__lte=max_prix)
    if min_superficie:
        queryset = queryset.filter(superficie__gte=min_superficie)
    if max_superficie:
        queryset = queryset.filter(superficie__lte=max_superficie)

    search_filters = {
        "ville": ville,
        "type_bien": type_bien,
        "nombre_pieces": int(nombre_pieces) if nombre_pieces else None,
        "min_prix": float(min_prix) if min_prix else None,
        "max_prix": float(max_prix) if max_prix else None,
        "superficie": float(filters.get("superficie")) if filters.get("superficie") else None,
    }

    results = []
    for annonce in queryset:
        score, why = score_annonce(annonce, search_filters, keywords)
        if score > 0 or not any([ville, type_bien, nombre_pieces, min_prix, max_prix]):
            if score == 0 and not any([ville, type_bien]):
                score = 1
                why = ["listing"]
            results.append({"score": score, "annonce": annonce, "why": why})

    results.sort(key=lambda x: (x["score"], x["annonce"].date_publication), reverse=True)
    return results


class SmartSearchNLView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        query = request.data.get("query", "").strip()
        if not query:
            return Response({"error": "query est obligatoire"}, status=400)

        parsed = parse_natural_language(query)
        filters = {k: v for k, v in parsed.items() if k != "keywords" and v not in (None, "", [])}
        results = _run_smart_search(request, filters, parsed.get("keywords", []))

        return Response({
            "annonces": _serialize_search_results(results, request),
            "parsed_filters": parsed,
            "keywords": parsed.get("keywords", []),
        })


class HideAnnonceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        annonce = get_object_or_404(Annonce, pk=pk)
        if annonce.proprietaire != request.user and not request.user.is_staff:
            return Response({"error": "Permission refusée"}, status=403)
        annonce.is_hidden = True
        annonce.save()
        return Response({"message": "Annonce masquée", "is_hidden": True})


class UnhideAnnonceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        annonce = get_object_or_404(Annonce, pk=pk)
        if annonce.proprietaire != request.user and not request.user.is_staff:
            return Response({"error": "Permission refusée"}, status=403)
        annonce.is_hidden = False
        annonce.save()
        return Response({"message": "Annonce visible", "is_hidden": False})


class SiteContactCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SiteContactMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        contact = serializer.save()

        admins = User.objects.filter(Q(is_staff=True) | Q(is_superuser=True))
        for admin in admins:
            Notification.objects.create(
                user=admin,
                titre="Nouveau message contact agence",
                contenu=f"{contact.nom} a envoyé un message: {contact.sujet or 'Sans sujet'}",
                type_notification="system",
            )

        return Response(
            {"message": "Message envoyé avec succès", "id": contact.id},
            status=201,
        )


class AdminSiteContactListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        messages = SiteContactMessage.objects.all().order_by("-date_envoi")
        return Response(SiteContactMessageSerializer(messages, many=True).data)


class AdminSiteContactDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        contact = get_object_or_404(SiteContactMessage, pk=pk)
        if request.data.get("is_read") is True:
            contact.is_read = True
        reply = request.data.get("reply", "").strip()
        if reply:
            contact.reply = reply
            contact.replied_at = timezone.now()
            contact.replied_by = request.user
            contact.is_read = True
        contact.save()
        return Response(SiteContactMessageSerializer(contact).data)


class DeleteConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)
        if request.user not in [conversation.user1, conversation.user2]:
            return Response({"error": "Permission refusée"}, status=403)

        if conversation.user1 == request.user:
            conversation.hidden_for_user1 = True
        else:
            conversation.hidden_for_user2 = True
        conversation.save()
        return Response({"message": "Conversation masquée"})


class SuperAdminLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        username_or_email = request.data.get("username")
        user = None
        if username_or_email:
            if "@" in username_or_email:
                user = User.objects.filter(email=username_or_email).first()
            else:
                user = User.objects.filter(username=username_or_email).first()

        if not user:
            return Response({"error": "Utilisateur introuvable."}, status=404)

        if not user.is_superuser:
            return Response(
                {"error": "Accès réservé au super administrateur."},
                status=403,
            )

        return super().post(request, *args, **kwargs)


class MemberLoginView(TokenObtainPairView):
    """Login for normal members only (not staff)."""
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code != 200:
            return response

        username_or_email = request.data.get("username")
        user = None
        if username_or_email:
            if "@" in username_or_email:
                user = User.objects.filter(email=username_or_email).first()
            else:
                user = User.objects.filter(username=username_or_email).first()

        if user and (user.is_staff or user.is_superuser):
            return Response(
                {"error": "Utilisez la page de connexion admin ou super admin."},
                status=403,
            )
        return response
