from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# Simple home view
def home(request):
    return HttpResponse("Hello! Django server is working!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),  # if you have accounts urls
    path('', home),  # <-- This handles the root URL
#     path("api/", include("dashboard.urls")),
 ]
