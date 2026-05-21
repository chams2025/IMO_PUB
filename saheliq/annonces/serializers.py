from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    Annonce,
    ContactMessage,
    Favorite,
    Notification,
    Report,
    Review,
    SiteContactMessage,
)


class AnnonceSerializer(serializers.ModelSerializer):
    proprietaire = serializers.ReadOnlyField(source='proprietaire.username')
    main_image = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = Annonce
        fields = '__all__'

    def get_main_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def validate_superficie(self, value):
        if value is not None and value <= 0:
           raise serializers.ValidationError("La superficie doit être supérieure à 0.")
        return value

    def validate_nombre_pieces(self, value):
        if value is not None and value <= 0:
           raise serializers.ValidationError("Le nombre de pièces doit être supérieur à 0.")
        return value

    def validate_prix(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Le prix doit être supérieur à 0.")
        return value

    def validate_titre(self, value):
        if not value.strip():
            raise serializers.ValidationError("Le titre est obligatoire.")
        return value

    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError("La description est obligatoire.")
        return value

    def validate_ville(self, value):
        if not value.strip():
            raise serializers.ValidationError("La ville est obligatoire.")
        return value
    def get_average_rating(self, obj):
       reviews = obj.reviews.all()
       if reviews.exists():
          avg = sum(review.rating for review in reviews) /    reviews.count()
          return round(avg, 1)
       return 0

    def get_reviews_count(self, obj):
        return obj.reviews.count()


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['annonce', 'date_envoi', 'sender', 'is_read']

    def validate_nom(self, value):
        if not value.strip():
            raise serializers.ValidationError("Le nom est obligatoire.")
        return value

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError("Le message est obligatoire.")
        return value


class FavoriteSerializer(serializers.ModelSerializer):
    annonce = AnnonceSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = '__all__'
        read_only_fields = ['user', 'date_ajout']


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Nom d'utilisateur déjà utilisé")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email déjà utilisé")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get("username")

        if username_or_email and "@" in username_or_email:
            user = User.objects.filter(email=username_or_email).first()
            if user:
                attrs["username"] = user.username

        data = super().validate(attrs)
        data["username"] = self.user.username
        data["email"] = self.user.email
        return data


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'titre', 'contenu', 'type_notification', 'created_at']


class ProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_superuser']
        read_only_fields = ['id', 'is_staff', 'is_superuser']

    def validate_username(self, value):
        request = self.context.get('request')
        if request and User.objects.filter(username=value).exclude(pk=request.user.pk).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value

    def validate_email(self, value):
        request = self.context.get('request')
        if request and User.objects.filter(email=value).exclude(pk=request.user.pk).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['user', 'annonce', 'created_at']
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Review
        fields = ['id', 'user', 'annonce', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5.")
        return value


class SiteContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteContactMessage
        fields = '__all__'
        read_only_fields = ['date_envoi', 'is_read', 'reply', 'replied_at', 'replied_by']