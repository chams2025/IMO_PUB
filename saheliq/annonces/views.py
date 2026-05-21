import os

from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, permissions, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Annonce,
    ContactMessage,
    Favorite,
    Notification,
    Report,
    Conversation,
    Message,
    AnnonceImage,
    Review,
    SiteContactMessage,
)
from .serializers import (
    AnnonceSerializer,
    ProfileSerializer,
    RegisterSerializer,
    ContactMessageSerializer,
    FavoriteSerializer,
    NotificationSerializer,
    CustomTokenObtainPairSerializer,
    ReportSerializer,
    ReviewSerializer,
)
from .permissions import IsOwnerOrReadOnly, IsSuperAdmin
from .pricing import check_price, estimate_price
from .smart_search_utils import parse_natural_language, score_annonce, visible_annonces_queryset


class AnnonceListCreateView(generics.ListCreateAPIView):
    serializer_class = AnnonceSerializer
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['ville', 'type_bien', 'nombre_pieces']
    search_fields = ['titre', 'description', 'ville']
    ordering_fields = ['prix', 'date_publication', 'superficie']
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user if self.request.user.is_authenticated else None
        queryset = visible_annonces_queryset(user)

        min_prix = self.request.query_params.get('min_prix')
        max_prix = self.request.query_params.get('max_prix')
        min_superficie = self.request.query_params.get('min_superficie')
        max_superficie = self.request.query_params.get('max_superficie')

        if min_prix:
            queryset = queryset.filter(prix__gte=min_prix)
        if max_prix:
            queryset = queryset.filter(prix__lte=max_prix)
        if min_superficie:
            queryset = queryset.filter(superficie__gte=min_superficie)
        if max_superficie:
            queryset = queryset.filter(superficie__lte=max_superficie)

        return queryset

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        annonce = serializer.save(proprietaire=self.request.user)

        Notification.objects.create(
            user=self.request.user,
            titre="Nouvelle annonce publiée",
            contenu=f"Votre annonce '{annonce.titre}' a été publiée avec succès.",
            type_notification="annonce",
            annonce=annonce
        )


class AnnonceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Annonce.objects.select_related('proprietaire').all()
    serializer_class = AnnonceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Utilisateur créé avec succès"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class AdminLoginView(TokenObtainPairView):
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

        if not user.is_staff:
            return Response(
                {"error": "Accès réservé au manager ou super admin."},
                status=403
            )

        if user.is_superuser:
            return Response(
                {"error": "Utilisez la page super admin pour vous connecter."},
                status=403
            )

        return super().post(request, *args, **kwargs)


class MyAnnonceListView(generics.ListAPIView):
    serializer_class = AnnonceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Annonce.objects.filter(
            proprietaire=self.request.user
        ).order_by('-date_publication')


class ContactMessageCreateView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        annonce = get_object_or_404(Annonce, pk=self.kwargs['pk'])

        if self.request.user.is_authenticated:
            serializer.save(annonce=annonce, sender=self.request.user)
        else:
            serializer.save(annonce=annonce)

        Notification.objects.create(
            user=annonce.proprietaire,
            titre="Nouveau message reçu",
            contenu=f"Vous avez reçu un nouveau message concernant l'annonce '{annonce.titre}'.",
            type_notification="message",
            annonce=annonce
        )


class MyMessagesView(generics.ListAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ContactMessage.objects.filter(
            annonce__proprietaire=self.request.user
        ).select_related('annonce', 'sender').order_by('-date_envoi')


class SentMessagesView(generics.ListAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ContactMessage.objects.filter(
            sender=self.request.user
        ).select_related('annonce').order_by('-date_envoi')


class UnreadMessagesCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = ContactMessage.objects.filter(
            annonce__proprietaire=request.user,
            is_read=False
        ).count()
        return Response({"unread_messages_count": count})


class MarkMessageAsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        message = get_object_or_404(ContactMessage, pk=pk)

        if message.annonce.proprietaire != request.user:
            return Response({"error": "Permission denied"}, status=403)

        message.is_read = True
        message.save()

        return Response({"message": "Message marqué comme lu"})


class DeleteMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        message = get_object_or_404(ContactMessage, pk=pk)

        is_sender = message.sender == request.user
        is_owner = message.annonce.proprietaire == request.user
        is_admin = request.user.is_staff

        if not (is_sender or is_owner or is_admin):
            return Response(
                {"error": "Vous n'avez pas la permission de supprimer ce message."},
                status=403
            )

        message.delete()
        return Response({"message": "Message supprimé avec succès."}, status=200)


class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(
            user=self.request.user
        ).select_related('annonce').order_by('-date_ajout')

    def perform_create(self, serializer):
        annonce_id = self.request.data.get('annonce')

        if not annonce_id:
            raise serializers.ValidationError({"annonce": "Ce champ est obligatoire."})

        annonce = get_object_or_404(Annonce, pk=annonce_id)

        if Favorite.objects.filter(user=self.request.user, annonce=annonce).exists():
            raise serializers.ValidationError({"detail": "Déjà en favoris."})

        serializer.save(user=self.request.user, annonce=annonce)

        Notification.objects.create(
            user=annonce.proprietaire,
            titre="Annonce ajoutée aux favoris",
            contenu=f"{self.request.user.username} a ajouté votre annonce '{annonce.titre}' en favoris.",
            type_notification="annonce",
            annonce=annonce
        )


class FavoriteDeleteView(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')


class UnreadNotificationCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({"unread_count": count})


class MarkNotificationAsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.is_read = True
        notification.save()

        return Response({"message": "Notification marked as read"})


class MarkAllNotificationsAsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)

        return Response({"message": "Toutes les notifications ont été marquées comme lues."})


class DeleteNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        notif = get_object_or_404(Notification, pk=pk, user=request.user)
        notif.delete()
        return Response({"message": "Notification supprimée"})


class CreateNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        notif = Notification.objects.create(
            user=request.user,
            titre="Test notification",
            contenu="Ceci est une notification de test",
            type_notification="system"
        )
        return Response({
            "id": notif.id,
            "message": "Notification créée"
        }, status=201)


class PriceEstimationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ville = request.data.get("ville")
        type_bien = request.data.get("type_bien")
        superficie = request.data.get("superficie")
        nombre_pieces = request.data.get("nombre_pieces")

        if not all([ville, type_bien, superficie, nombre_pieces]):
            return Response({"error": "Tous les champs sont obligatoires"}, status=400)

        try:
            superficie = float(superficie)
            nombre_pieces = int(nombre_pieces)
        except (ValueError, TypeError):
            return Response({"error": "Données invalides"}, status=400)

        if superficie <= 0 or nombre_pieces <= 0:
            return Response({"error": "Superficie et nombre de pièces doivent être > 0"}, status=400)

        result = estimate_price(ville, type_bien, superficie, nombre_pieces)
        if not result:
            return Response({"error": "Impossible d'estimer le prix (données insuffisantes)."}, status=500)
        return Response(result)


class PriceCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            prix = float(request.data.get("prix"))
            superficie = float(request.data.get("superficie"))
            nombre_pieces = int(request.data.get("nombre_pieces"))
            ville = request.data.get("ville")
            type_bien = request.data.get("type_bien")
        except (TypeError, ValueError):
            return Response({"error": "Données invalides"}, status=400)

        if not all([prix, superficie, nombre_pieces, ville, type_bien]):
            return Response({"error": "Tous les champs sont obligatoires"}, status=400)

        if prix <= 0 or superficie <= 0 or nombre_pieces <= 0:
            return Response({"error": "Les valeurs doivent être supérieures à 0"}, status=400)

        result = check_price(prix, ville, type_bien, superficie, nombre_pieces)
        if not result:
            return Response({"error": "Impossible d'analyser le prix."}, status=500)
        return Response(result)


class RecommendationView(generics.ListAPIView):
    serializer_class = AnnonceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        annonce = Annonce.objects.filter(pk=self.kwargs['pk']).first()
        if not annonce:
            return Annonce.objects.none()

        queryset = Annonce.objects.filter(
            ville=annonce.ville,
            type_bien=annonce.type_bien
        ).exclude(pk=annonce.pk)

        return queryset.order_by('-date_publication')[:5]


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def put(self, request):
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=False
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        request.user.delete()
        return Response({"message": "Compte supprimé avec succès."}, status=200)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response({"error": "Tous les champs sont obligatoires"}, status=400)

        if not check_password(old_password, user.password):
            return Response({"error": "Mot de passe incorrect"}, status=400)

        if len(new_password) < 8:
            return Response({"error": "Le nouveau mot de passe doit contenir au moins 8 caractères"}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Mot de passe changé avec succès"})


class UserDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        data = {
            "my_annonces_count": Annonce.objects.filter(proprietaire=user).count(),
            "my_messages_unread": ContactMessage.objects.filter(
                annonce__proprietaire=user,
                is_read=False
            ).count(),
            "my_favorites_count": Favorite.objects.filter(user=user).count(),
            "notifications_unread": Notification.objects.filter(
                user=user,
                is_read=False
            ).count(),
        }

        return Response(data)


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        data = {
            "total_users": User.objects.count(),
            "active_users": User.objects.filter(is_active=True).count(),
            "blocked_users": User.objects.filter(is_active=False).count(),
            "total_annonces": Annonce.objects.count(),
            "total_messages": ContactMessage.objects.count() + Message.objects.count(),
            "total_favorites": Favorite.objects.count(),
            "total_notifications": Notification.objects.count(),
            "total_reports": Report.objects.count(),
        }
        return Response(data)


class AdminUsersListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.annotate(
            annonces_count=Count('annonces')
        ).values(
            'id', 'username', 'email', 'is_active', 'is_staff', 'is_superuser', 'annonces_count'
        ).order_by('-id')

        return Response(users)


class AdminAnnoncesListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AnnonceSerializer

    def get_queryset(self):
        return Annonce.objects.select_related('proprietaire').order_by('-date_publication')


class RecentActivityView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        latest_users = list(
            User.objects.order_by('-id').values('id', 'username', 'email')[:5]
        )
        latest_annonces = list(
            Annonce.objects.order_by('-date_publication').values('id', 'titre', 'ville', 'date_publication')[:5]
        )
        latest_messages = list(
            ContactMessage.objects.order_by('-date_envoi').values('id', 'nom', 'email', 'date_envoi')[:5]
        )

        return Response({
            "latest_users": latest_users,
            "latest_annonces": latest_annonces,
            "latest_messages": latest_messages,
        })


class AdminChartView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        data = {
            "annonces_by_city": list(
                Annonce.objects.values('ville').annotate(count=Count('id')).order_by('-count')
            ),
            "annonces_by_type": list(
                Annonce.objects.values('type_bien').annotate(count=Count('id')).order_by('-count')
            ),
            "annonces_by_month": list(
                Annonce.objects.annotate(month=TruncMonth('date_publication'))
                .values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            ),
            "users_by_month": list(
                User.objects.annotate(month=TruncMonth('date_joined'))
                .values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            ),
            "reports_count": Report.objects.count(),
            "favorites_count": Favorite.objects.count(),
            "messages_count": Message.objects.count(),
            "contact_messages_count": SiteContactMessage.objects.count(),
        }
        return Response(data)


class AdminReportListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ReportSerializer

    def get_queryset(self):
        return Report.objects.select_related('annonce', 'user').all()


class ToggleUserActiveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        user.is_active = not user.is_active
        user.save()

        return Response({
            "message": "User status updated",
            "is_active": user.is_active
        })


class AdminDeleteAnnonceView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        annonce = get_object_or_404(Annonce, pk=pk)
        annonce.delete()
        return Response({"message": "Annonce supprimée par l'administrateur."}, status=200)


class AdminUpdateAnnonceView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AnnonceSerializer
    queryset = Annonce.objects.all()
    parser_classes = [MultiPartParser, FormParser]


class AdminSendNotificationView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        user_id = request.data.get("user_id")
        titre = request.data.get("titre")
        contenu = request.data.get("contenu", "")

        if not user_id or not titre:
            return Response({"error": "user_id et titre sont obligatoires."}, status=400)

        user = get_object_or_404(User, pk=user_id)

        notif = Notification.objects.create(
            user=user,
            titre=titre,
            contenu=contenu,
            type_notification="system"
        )

        return Response({
            "id": notif.id,
            "message": "Notification envoyée avec succès."
        }, status=201)


class ReportAnnonceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        annonce = get_object_or_404(Annonce, pk=pk)
        reason = request.data.get("reason")
        details = request.data.get("details", "")

        if annonce.proprietaire == request.user:
            return Response({"error": "Vous ne pouvez pas signaler votre propre annonce."}, status=400)

        if not reason or not str(reason).strip():
            return Response({"error": "La raison du signalement est obligatoire."}, status=400)

        if Report.objects.filter(annonce=annonce, user=request.user).exists():
            return Response({"error": "Vous avez déjà signalé cette annonce."}, status=400)

        Report.objects.create(
            annonce=annonce,
            user=request.user,
            reason=str(reason).strip()[:255],
            details=str(details).strip() if details else "",
        )

        return Response({"message": "Annonce signalée"}, status=201)


class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get("receiver_id")
        content = request.data.get("content")

        if not receiver_id or not content:
            return Response(
                {"error": "receiver_id et content sont obligatoires."},
                status=400
            )

        content = content.strip()
        if not content:
            return Response(
                {"error": "Le message ne peut pas être vide."},
                status=400
            )

        receiver = get_object_or_404(User, id=receiver_id)

        if receiver == request.user:
            return Response(
                {"error": "Vous ne pouvez pas vous envoyer un message à vous-même."},
                status=400
            )

        conversation = Conversation.objects.filter(
            Q(user1=request.user, user2=receiver) |
            Q(user1=receiver, user2=request.user)
        ).first()

        if not conversation:
            conversation = Conversation.objects.create(
                user1=request.user,
                user2=receiver
            )

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )
        conversation.updated_at = timezone.now()
        conversation.save(update_fields=['updated_at'])

        Notification.objects.create(
            user=receiver,
            titre="Nouveau message",
            contenu=f"Vous avez reçu un nouveau message de {request.user.username}.",
            type_notification="message"
        )

        return Response({
            "message": "Message envoyé avec succès.",
            "conversation_id": conversation.id,
            "message_id": message.id
        }, status=201)


class MyConversationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(
            Q(user1=request.user) | Q(user2=request.user)
        ).order_by('-updated_at')

        data = []
        for conv in conversations:
            if conv.user1 == request.user and conv.hidden_for_user1:
                continue
            if conv.user2 == request.user and conv.hidden_for_user2:
                continue

            other_user = conv.user2 if conv.user1 == request.user else conv.user1
            last_message = conv.messages.order_by('-created_at').first()
            unread_count = conv.messages.filter(is_read=False).exclude(sender=request.user).count()

            data.append({
                "conversation_id": conv.id,
                "with_user_id": other_user.id,
                "with_user_username": other_user.username,
                "last_message": last_message.content if last_message else "",
                "last_message_date": last_message.created_at if last_message else None,
                "unread_count": unread_count,
            })

        return Response(data)


class ConversationMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)

        if request.user not in [conversation.user1, conversation.user2]:
            return Response({"error": "Permission denied"}, status=403)

        messages = conversation.messages.order_by('created_at')
        conversation.messages.exclude(sender=request.user).filter(is_read=False).update(is_read=True)

        data = []
        for msg in messages:
            if msg.sender == request.user and msg.deleted_for_sender:
                continue
            if msg.sender != request.user and msg.deleted_for_receiver:
                continue
            data.append({
                "id": msg.id,
                "sender_id": msg.sender.id,
                "sender_username": msg.sender.username,
                "content": msg.content,
                "created_at": msg.created_at,
                "is_read": msg.is_read,
            })

        return Response(data)


class DeleteMessageChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        message = get_object_or_404(Message, pk=pk)

        if message.sender != request.user and not request.user.is_staff:
            return Response(
                {"error": "Vous n'avez pas la permission de supprimer ce message."},
                status=403
            )

        if message.sender == request.user:
            message.deleted_for_sender = True
        else:
            message.deleted_for_receiver = True
        message.save()
        return Response({"message": "Message supprimé avec succès."}, status=200)


class SuperAdminManagersListView(generics.ListAPIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        managers = User.objects.filter(is_staff=True).values(
            'id', 'username', 'email', 'is_active', 'is_staff', 'is_superuser'
        ).order_by('-id')
        return Response(managers)


class CreateManagerView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not email or not password:
            return Response(
                {"error": "username, email et password sont obligatoires."},
                status=400
            )

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username déjà utilisé."}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email déjà utilisé."}, status=400)

        manager = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        manager.is_staff = True
        manager.is_superuser = False
        manager.save()

        return Response({
            "message": "Manager créé avec succès.",
            "id": manager.id
        }, status=201)


class ToggleManagerActiveView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request, user_id):
        manager = get_object_or_404(User, id=user_id, is_staff=True)

        if manager.is_superuser:
            return Response(
                {"error": "Impossible de modifier un super admin."},
                status=400
            )

        manager.is_active = not manager.is_active
        manager.save()

        return Response({
            "message": "Statut du manager mis à jour.",
            "is_active": manager.is_active
        }, status=200)
class AddAnnonceImagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        annonce = get_object_or_404(Annonce, pk=pk, proprietaire=request.user)

        images = request.FILES.getlist('images')
        if not images:
            return Response({"error": "Aucune image envoyée."}, status=400)

        created = []
        has_primary = annonce.images.filter(is_primary=True).exists()

        for index, img in enumerate(images):
            annonce_image = AnnonceImage.objects.create(
                annonce=annonce,
                image=img,
                is_primary=(not has_primary and index == 0)
            )
            created.append({
                "id": annonce_image.id,
                "image": annonce_image.image.url,
                "is_primary": annonce_image.is_primary
            })

        return Response({
            "message": "Images ajoutées avec succès.",
            "images": created
        }, status=201)
class SetPrimaryAnnonceImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, annonce_id, image_id):
        annonce = get_object_or_404(Annonce, pk=annonce_id, proprietaire=request.user)
        image = get_object_or_404(AnnonceImage, pk=image_id, annonce=annonce)

        annonce.images.update(is_primary=False)
        image.is_primary = True
        image.save()

        return Response({"message": "Image principale mise à jour."}, status=200)
class DeleteAnnonceImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, annonce_id, image_id):
        annonce = get_object_or_404(Annonce, pk=annonce_id, proprietaire=request.user)
        image = get_object_or_404(AnnonceImage, pk=image_id, annonce=annonce)
        image.delete()
        return Response({"message": "Image supprimée."}, status=200)
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        annonce = get_object_or_404(Annonce, pk=self.kwargs['pk'])
        return Review.objects.filter(annonce=annonce).order_by('-created_at')

    def perform_create(self, serializer):
        annonce = get_object_or_404(Annonce, pk=self.kwargs['pk'])
        serializer.save(user=self.request.user, annonce=annonce)

class SmartSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .views_extensions import _run_smart_search, _serialize_search_results

        filters = {
            "ville": request.query_params.get("ville", "").strip(),
            "type_bien": request.query_params.get("type_bien", "").strip(),
            "nombre_pieces": request.query_params.get("nombre_pieces"),
            "min_prix": request.query_params.get("min_prix"),
            "max_prix": request.query_params.get("max_prix"),
            "min_superficie": request.query_params.get("min_superficie"),
            "max_superficie": request.query_params.get("max_superficie"),
            "superficie": request.query_params.get("superficie"),
        }
        q = request.query_params.get("q", "").strip()
        keywords = []
        if q:
            parsed = parse_natural_language(q)
            for k, v in parsed.items():
                if k == "keywords":
                    keywords = v
                elif v and k in filters and not filters.get(k):
                    filters[k] = v

        results = _run_smart_search(request, filters, keywords)
        return Response({
            "annonces": _serialize_search_results(results, request),
            "parsed_filters": filters,
            "keywords": keywords,
        }, status=200)