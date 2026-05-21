from django.db import models
from django.contrib.auth.models import User


class Annonce(models.Model):
    TYPE_BIEN_CHOICES = (
        ('Appartement', 'Appartement'),
        ('Maison', 'Maison'),
        ('Villa', 'Villa'),
        ('Studio', 'Studio'),
        ('Terrain', 'Terrain'),
    )

    titre = models.CharField(max_length=100)
    description = models.TextField()
    type_bien = models.CharField(max_length=50, default="Appartement")
    superficie = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    nombre_pieces = models.IntegerField(default=1)
    prix = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    ville = models.CharField(max_length=100)
    image = models.ImageField(upload_to='annonces/', null=True, blank=True)
    is_hidden = models.BooleanField(default=False)
    date_publication = models.DateTimeField(auto_now_add=True)
    proprietaire = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='annonces'
    )

    def __str__(self):
        return self.titre

class AnnonceImage(models.Model):
    annonce = models.ForeignKey(Annonce, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='annonces/gallery/')
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.annonce.titre}"

class ContactMessage(models.Model):
    annonce = models.ForeignKey(Annonce, on_delete=models.CASCADE, related_name='messages')
    nom = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    sender = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_messages'
    )

    def __str__(self):
        return f"{self.nom} - {self.annonce.titre}"


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    annonce = models.ForeignKey(Annonce, on_delete=models.CASCADE, related_name='favorited_by')
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'annonce']

    def __str__(self):
        return f"{self.user.username} -> {self.annonce.titre}"


class Notification(models.Model):
    TYPE_CHOICES = (
        ('message', 'Message'),
        ('annonce', 'Annonce'),
        ('system', 'System'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    titre = models.CharField(max_length=255)
    contenu = models.TextField(blank=True, null=True)
    type_notification = models.CharField(max_length=20, choices=TYPE_CHOICES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    annonce = models.ForeignKey(
        Annonce,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )

    def __str__(self):
        return f"{self.user.username} - {self.titre}"


class Report(models.Model):
    annonce = models.ForeignKey(Annonce, on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    reason = models.CharField(max_length=255)
    details = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['annonce', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f"Report by {self.user.username} on {self.annonce.titre}"


# 🔥 NEW: Conversation
class Conversation(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_user2')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    hidden_for_user1 = models.BooleanField(default=False)
    hidden_for_user2 = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user1.username} - {self.user2.username}"


# 🔥 NEW: Message (chat)
class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    deleted_for_sender = models.BooleanField(default=False)
    deleted_for_receiver = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username}: {self.content[:20]}"
class Review(models.Model):
    annonce = models.ForeignKey(Annonce, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField()
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['annonce', 'user']

    def __str__(self):
        return f"{self.user.username} - {self.annonce.titre} ({self.rating})"


class SiteContactMessage(models.Model):
    nom = models.CharField(max_length=100)
    email = models.EmailField()
    telephone = models.CharField(max_length=30, blank=True, default='')
    type_projet = models.CharField(max_length=100, blank=True, default='')
    sujet = models.CharField(max_length=200, blank=True, default='')
    message = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    reply = models.TextField(blank=True, default='')
    replied_at = models.DateTimeField(null=True, blank=True)
    replied_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='contact_replies'
    )

    class Meta:
        ordering = ['-date_envoi']

    def __str__(self):
        return f"{self.nom} - {self.sujet or 'Contact'}"