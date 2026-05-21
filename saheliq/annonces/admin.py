from django.contrib import admin
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


@admin.register(Annonce)
class AnnonceAdmin(admin.ModelAdmin):
    list_display = ('id', 'titre', 'ville', 'prix', 'is_hidden', 'proprietaire', 'date_publication')
    search_fields = ('titre', 'ville')
    list_filter = ('ville', 'type_bien')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'email', 'annonce', 'date_envoi', 'is_read')
    search_fields = ('nom', 'email')
    list_filter = ('is_read',)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'annonce', 'date_ajout')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'titre', 'type_notification', 'is_read', 'created_at')
    list_filter = ('type_notification', 'is_read')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'annonce', 'reason', 'created_at')
    search_fields = ('reason',)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user1', 'user2', 'created_at')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'content', 'created_at', 'is_read')

@admin.register(AnnonceImage)
class AnnonceImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'annonce', 'is_primary', 'uploaded_at')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'annonce', 'user', 'rating', 'created_at')


@admin.register(SiteContactMessage)
class SiteContactMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'email', 'sujet', 'is_read', 'date_envoi')
    list_filter = ('is_read',)