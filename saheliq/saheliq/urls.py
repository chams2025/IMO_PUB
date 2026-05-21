from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.http import JsonResponse

def test_api(request):
    return JsonResponse({"message": "Django connected with React!"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("annonces.urls")),
    path("api/test/", test_api),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)