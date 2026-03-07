from django.urls import path, include
from .views import (
    RegisterView,
    LoginView,
    AdminDashboardView,
    UserDashboardView,
    UserManagementView,
    ForgotPasswordView, 
    ResetPasswordView
)
urlpatterns = [
    #  Authentication
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),

    #  Dashboards
    path('admin-dashboard/', AdminDashboardView.as_view()),
    path('user-dashboard/', UserDashboardView.as_view()),

    #  User Management (CRUD)
    path('users/', UserManagementView.as_view()),
    path('users/<int:pk>/', UserManagementView.as_view()),

    # Forgot Password
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),

    #Dashboard
    #  path("dashboard/overview/", dashboard_overview, name="dashboard-overview"),
]
