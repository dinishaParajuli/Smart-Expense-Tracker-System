from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    AdminDashboardView,
    UserDashboardView,
    ProfileView,
    UserManagementView,
    ForgotPasswordView, 
    ResetPasswordView,
    GoalListCreateView,
    GoalDetailView,
    ChallengeListCreateView,
    ChallengeDetailView,
    TransactionListCreateView,
    TransactionDetailView,
    TransactionSummaryView,
    DashboardOverviewView,
    BudgetListCreateView,
    BudgetDetailView,
)
urlpatterns = [
    #  Authentication
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    #  Dashboards
    path('admin-dashboard/', AdminDashboardView.as_view()),
    path('user-dashboard/', UserDashboardView.as_view()),
    path('profile/', ProfileView.as_view()),

    #  User Management (CRUD)
    path('users/', UserManagementView.as_view()),
    path('users/<int:pk>/', UserManagementView.as_view()),

    # Goals & Challenges (CRUD)
    path('goals/', GoalListCreateView.as_view(), name='goal-list-create'),
    path('goals/<int:pk>/', GoalDetailView.as_view(), name='goal-detail'),
    path('challenges/', ChallengeListCreateView.as_view(), name='challenge-list-create'),
    path('challenges/<int:pk>/', ChallengeDetailView.as_view(), name='challenge-detail'),

    # Transactions (income/expense CRUD)
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('transactions/summary/', TransactionSummaryView.as_view(), name='transaction-summary'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),
    path('dashboard/overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),

    # Budgets (CRUD)
    path('budgets/', BudgetListCreateView.as_view(), name='budget-list-create'),
    path('budgets/<int:pk>/', BudgetDetailView.as_view(), name='budget-detail'),

    # Forgot Password
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),

    #Dashboard
    #  path("dashboard/overview/", dashboard_overview, name="dashboard-overview"),
]
