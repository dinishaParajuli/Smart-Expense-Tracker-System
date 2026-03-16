from django.urls import path, include
from .views import (
    RegisterView,
    LoginView,
    AdminDashboardView,
    UserDashboardView,
    UserManagementView,
    ForgotPasswordView, 
    ResetPasswordView,
    TransactionListCreateView,
    TransactionDetailView,
    TransactionSummaryView,
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

    # Transactions (income/expense CRUD)
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('transactions/summary/', TransactionSummaryView.as_view(), name='transaction-summary'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),

    # Forgot Password
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),

    #Dashboard
    #  path("dashboard/overview/", dashboard_overview, name="dashboard-overview"),
]
