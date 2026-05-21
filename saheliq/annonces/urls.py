from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminAnnoncesListView,
    AdminChartView,
    AdminDeleteAnnonceView,
    AdminLoginView,
    AdminReportListView,
    AdminSendNotificationView,
    AdminStatsView,
    AdminUpdateAnnonceView,
    AdminUsersListView,
    AnnonceDetailView,
    AnnonceListCreateView,
    ChangePasswordView,
    ContactMessageCreateView,
    ConversationMessagesView,
    CreateManagerView,
    CreateNotificationView,
    CustomLoginView,
    DeleteAccountView,
    DeleteMessageChatView,
    DeleteMessageView,
    DeleteNotificationView,
    FavoriteDeleteView,
    FavoriteListCreateView,
    MarkAllNotificationsAsReadView,
    MarkMessageAsReadView,
    MarkNotificationAsReadView,
    MyAnnonceListView,
    MyConversationsView,
    MyMessagesView,
    NotificationListView,
    PriceEstimationView,
    PriceCheckView,
    ProfileView,
    RecommendationView,
    RecentActivityView,
    RegisterView,
    ReportAnnonceView,
    SendMessageView,
    SentMessagesView,
    SuperAdminManagersListView,
    ToggleManagerActiveView,
    ToggleUserActiveView,
    UnreadMessagesCountView,
    UnreadNotificationCountView,
    UserDashboardView,
    AddAnnonceImagesView,
    SetPrimaryAnnonceImageView,
    DeleteAnnonceImageView,
    ReviewListCreateView,
    SmartSearchView,
)
from .views_extensions import (
    AdminSiteContactDetailView,
    AdminSiteContactListView,
    DeleteConversationView,
    HideAnnonceView,
    MemberLoginView,
    SiteContactCreateView,
    SmartSearchNLView,
    SuperAdminLoginView,
    UnhideAnnonceView,
)
from .web_views import price_estimator_page

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MemberLoginView.as_view(), name='login'),
    path('member/login/', MemberLoginView.as_view(), name='member-login'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),

    # User dashboard
    path('user/dashboard/', UserDashboardView.as_view(), name='user-dashboard'),

    # Annonces
    path('annonces/', AnnonceListCreateView.as_view(), name='annonce-list-create'),
    path('annonces/<int:pk>/', AnnonceDetailView.as_view(), name='annonce-detail'),
    path('annonces/<int:pk>/hide/', HideAnnonceView.as_view(), name='annonce-hide'),
    path('annonces/<int:pk>/unhide/', UnhideAnnonceView.as_view(), name='annonce-unhide'),
    path('my-annonces/', MyAnnonceListView.as_view(), name='my-annonces'),
    path('annonces/<int:pk>/contact/', ContactMessageCreateView.as_view(), name='annonce-contact'),
    path('annonces/<int:pk>/recommendations/', RecommendationView.as_view(), name='annonce-recommendations'),
    path('annonces/<int:pk>/report/', ReportAnnonceView.as_view(), name='report-annonce'),
    path('smart-search/', SmartSearchView.as_view(), name='smart-search'),
    path('smart-search-nl/', SmartSearchNLView.as_view(), name='smart-search-nl'),

    # Site contact (agency)
    path('contact/', SiteContactCreateView.as_view(), name='site-contact'),
    path('admin/contact-messages/', AdminSiteContactListView.as_view(), name='admin-contact-messages'),
    path('admin/contact-messages/<int:pk>/', AdminSiteContactDetailView.as_view(), name='admin-contact-detail'),

    # Messages (annonce inquiries)
    path('my-messages/', MyMessagesView.as_view(), name='my-messages'),
    path('messages/sent/', SentMessagesView.as_view(), name='sent-messages'),
    path('messages/unread-count/', UnreadMessagesCountView.as_view(), name='unread-messages-count'),
    path('messages/<int:pk>/read/', MarkMessageAsReadView.as_view(), name='mark-message-read'),
    path('messages/<int:pk>/', DeleteMessageView.as_view(), name='delete-message'),

    # Favorites
    path('favorites/', FavoriteListCreateView.as_view(), name='favorites'),
    path('favorites/<int:pk>/', FavoriteDeleteView.as_view(), name='favorite-delete'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/unread-count/', UnreadNotificationCountView.as_view(), name='notifications-unread-count'),
    path('notifications/<int:pk>/read/', MarkNotificationAsReadView.as_view(), name='notification-mark-read'),
    path('notifications/mark-all-read/', MarkAllNotificationsAsReadView.as_view(), name='notifications-mark-all-read'),
    path('notifications/<int:pk>/', DeleteNotificationView.as_view(), name='delete-notification'),
    path('notifications/create/', CreateNotificationView.as_view(), name='create-notification'),

    # AI / pricing
    path('estimate-price/', PriceEstimationView.as_view(), name='estimate-price'),
    path('check-price/', PriceCheckView.as_view(), name='check-price'),
    path('estimate-price/page/', price_estimator_page, name='estimate-price-page'),

    # Admin
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', AdminUsersListView.as_view(), name='admin-users'),
    path('admin/annonces/', AdminAnnoncesListView.as_view(), name='admin-annonces'),
    path('admin/recent-activity/', RecentActivityView.as_view(), name='admin-recent-activity'),
    path('admin/toggle-user/<int:user_id>/', ToggleUserActiveView.as_view(), name='toggle-user-active'),
    path('admin/charts/', AdminChartView.as_view(), name='admin-charts'),
    path('admin/reports/', AdminReportListView.as_view(), name='admin-reports'),
    path('admin/annonces/<int:pk>/delete/', AdminDeleteAnnonceView.as_view(), name='admin-delete-annonce'),
    path('admin/annonces/<int:pk>/update/', AdminUpdateAnnonceView.as_view(), name='admin-update-annonce'),
    path('admin/send-notification/', AdminSendNotificationView.as_view(), name='admin-send-notification'),
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),

    # Super Admin
    path('super-admin/login/', SuperAdminLoginView.as_view(), name='super-admin-login'),
    path('super-admin/managers/', SuperAdminManagersListView.as_view(), name='superadmin-managers-list'),
    path('super-admin/managers/create/', CreateManagerView.as_view(), name='create-manager'),
    path('super-admin/managers/<int:user_id>/toggle/', ToggleManagerActiveView.as_view(), name='toggle-manager'),

    # Chat
    path('chat/send/', SendMessageView.as_view(), name='chat-send'),
    path('chat/conversations/', MyConversationsView.as_view(), name='my-conversations'),
    path('chat/conversations/<int:conversation_id>/', ConversationMessagesView.as_view(), name='conversation-messages'),
    path('chat/conversations/<int:conversation_id>/delete/', DeleteConversationView.as_view(), name='chat-delete-conversation'),
    path('chat/messages/<int:pk>/delete/', DeleteMessageChatView.as_view(), name='chat-delete-message'),

    # Gallery & reviews
    path('annonces/<int:pk>/images/', AddAnnonceImagesView.as_view(), name='add-annonce-images'),
    path('annonces/<int:annonce_id>/images/<int:image_id>/set-primary/', SetPrimaryAnnonceImageView.as_view(), name='set-primary-annonce-image'),
    path('annonces/<int:annonce_id>/images/<int:image_id>/delete/', DeleteAnnonceImageView.as_view(), name='delete-annonce-image'),
    path('annonces/<int:pk>/reviews/', ReviewListCreateView.as_view(), name='annonce-reviews'),
]
