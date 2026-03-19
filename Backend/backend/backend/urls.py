from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static

# Simple home view
def home(request):
    return HttpResponse("Hello! Django server is working!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),  # if you have accounts urls
    path('api/receipt/', include('receipt_scanner.urls')),  # receipt scanner endpoints
    path('', home),  # <-- This handles the root URL
#     path("api/", include("dashboard.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
