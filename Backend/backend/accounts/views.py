from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from .models import User, Transaction
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, TransactionSerializer
from .permissions import IsAdminRole, IsUserRole
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from .serializers import ForgotPasswordSerializer, ResetPasswordSerializer
from django.http import JsonResponse


def format_npr(value):
    return f"NPR {float(value):,.2f}"


def get_recent_month_labels(month_count=6):
    now = timezone.now().date().replace(day=1)
    months = []
    cursor = now
    for _ in range(month_count):
        months.append(cursor)
        cursor = (cursor - timedelta(days=1)).replace(day=1)
    return list(reversed(months))


def filter_transactions(queryset, params):
    transaction_type = params.get("type")
    start_date = params.get("start_date")
    end_date = params.get("end_date")
    category = params.get("category")

    if transaction_type in {"income", "expense"}:
        queryset = queryset.filter(type=transaction_type)
    if start_date:
        queryset = queryset.filter(date__gte=start_date)
    if end_date:
        queryset = queryset.filter(date__lte=end_date)
    if category:
        queryset = queryset.filter(category__iexact=category)

    return queryset


class TransactionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        return filter_transactions(queryset, self.request.query_params)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class TransactionSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Transaction.objects.filter(user=request.user)
        queryset = filter_transactions(queryset, request.query_params)

        income_total = queryset.filter(type="income").aggregate(total=Sum("amount"))["total"] or 0
        expense_total = queryset.filter(type="expense").aggregate(total=Sum("amount"))["total"] or 0
        expense_breakdown_qs = (
            queryset.filter(type="expense")
            .values("category")
            .annotate(value=Sum("amount"))
            .order_by("category")
        )

        expense_breakdown = [
            {"name": item["category"], "value": float(item["value"] or 0)}
            for item in expense_breakdown_qs
        ]

        return Response(
            {
                "count": queryset.count(),
                "total_income": float(income_total),
                "total_expense": float(expense_total),
                "net": float(income_total - expense_total),
                "expense_breakdown": expense_breakdown,
            },
            status=status.HTTP_200_OK,
        )


class DashboardOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Transaction.objects.filter(user=request.user)

        income_total = queryset.filter(type="income").aggregate(total=Sum("amount"))["total"] or 0
        expense_total = queryset.filter(type="expense").aggregate(total=Sum("amount"))["total"] or 0
        balance = income_total - expense_total

        expense_breakdown_qs = (
            queryset.filter(type="expense")
            .values("category")
            .annotate(value=Sum("amount"))
            .order_by("category")
        )

        palette = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6", "#F97316", "#64748B"]
        category_spending = []
        for idx, item in enumerate(expense_breakdown_qs):
            category_spending.append(
                {
                    "name": item["category"],
                    "value": float(item["value"] or 0),
                    "color": palette[idx % len(palette)],
                }
            )

        month_points = get_recent_month_labels(6)
        monthly_qs = (
            queryset.annotate(month=TruncMonth("date"))
            .values("month", "type")
            .annotate(total=Sum("amount"))
        )

        month_map = {
            month.strftime("%Y-%m"): {"income": 0.0, "expense": 0.0}
            for month in month_points
        }

        for row in monthly_qs:
            if not row["month"]:
                continue
            key = row["month"].strftime("%Y-%m")
            if key in month_map:
                month_map[key][row["type"]] = float(row["total"] or 0)

        trend_labels = [month.strftime("%b") for month in month_points]
        spending_values = [month_map[month.strftime("%Y-%m")]["expense"] for month in month_points]
        avg_spend = (sum(spending_values) / len(spending_values)) if spending_values else 0
        budget_values = [avg_spend for _ in spending_values]

        data = {
            "profile": {
                "name": request.user.get_full_name() or request.user.username,
                "tier": "Premium",
                "locale": "Nepal",
            },
            "stats": [
                {
                    "key": "total_balance",
                    "label": "Total Balance",
                    "value": format_npr(balance),
                    "delta": format_npr(balance),
                    "deltaType": "neutral",
                },
                {
                    "key": "monthly_spending",
                    "label": "Monthly Spending",
                    "value": format_npr(spending_values[-1] if spending_values else 0),
                    "delta": str(queryset.filter(type="expense").count()),
                    "deltaType": "negative",
                },
                {
                    "key": "savings",
                    "label": "Savings",
                    "value": format_npr(income_total - expense_total),
                    "delta": format_npr(income_total),
                    "deltaType": "positive",
                },
                {
                    "key": "transactions",
                    "label": "Total Transactions",
                    "value": str(queryset.count()),
                    "delta": str(queryset.count()),
                    "deltaType": "neutral",
                },
            ],
            "categorySpending": category_spending,
            "trend": {
                "labels": trend_labels,
                "spending": spending_values,
                "budget": budget_values,
            },
        }

        return Response(data, status=status.HTTP_200_OK)

#  REGISTER
class RegisterView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=201)

        return Response(serializer.errors, status=400)


#  LOGIN
class LoginView(APIView):

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            return Response(serializer.validated_data, status=200)

        return Response(serializer.errors, status=400)


#  ADMIN DASHBOARD
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        return Response({"message": "Welcome Admin"})


#  USER DASHBOARD
class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsUserRole]

    def get(self, request):
        return Response({"message": "Welcome User"})


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


#  ADMIN USER CRUD
class UserManagementView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    #  GET all users or single user
    def get(self, request, pk=None):

        if pk:
            try:
                user = User.objects.get(pk=pk)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=404)

            serializer = UserSerializer(user)
            return Response(serializer.data)

        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    #  UPDATE user
    def put(self, request, pk=None):

        if not pk:
            return Response({"error": "User ID required"}, status=400)

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        serializer = UserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User updated successfully"})

        return Response(serializer.errors, status=400)

    #  DELETE user
    def delete(self, request, pk=None):

        if not pk:
            return Response({"error": "User ID required"}, status=400)

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        user.delete()
        return Response({"message": "User deleted successfully"})

#  Forgot Password Views
class ForgotPasswordView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip().lower()
        user_model = get_user_model()
        user = user_model.objects.filter(email__iexact=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

            send_mail(
                subject="Smart Expense Tracker - Reset your password",
                message=(
                    "We received a request to reset your password. "
                    f"Use this link to continue: {reset_link}"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

        return Response(
            {"detail": "If the account exists, a password reset link has been sent."},
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = get_user_model().objects.get(pk=user_id)
        except Exception:
            return Response({"detail": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response({"detail": "Password reset successful."}, status=status.HTTP_200_OK)


#dashboard view
# def dashboard_overview(request):
#     data = {
#         "profile": {
#             "name": "Regan Karki",
#             "tier": "Premium",
#             "locale": "Nepal",
#         },
#         "stats": [
#             {
#                 "key": "total_balance",
#                 "label": "Total Balance",
#                 "value": "NPR 125,450",
#                 "delta": "+5.2%",
#                 "deltaType": "positive",
#             },
#             {
#                 "key": "monthly_spending",
#                 "label": "Monthly Spending",
#                 "value": "NPR 50,200",
#                 "delta": "-12.3%",
#                 "deltaType": "negative",
#             },
#             {
#                 "key": "savings",
#                 "label": "Savings This Month",
#                 "value": "NPR 28,450",
#                 "delta": "+8.5%",
#                 "deltaType": "positive",
#             },
#             {
#                 "key": "transactions",
#                 "label": "Total Transactions",
#                 "value": "245",
#                 "delta": "245",
#                 "deltaType": "neutral",
#             },
#         ],
#         "categorySpending": [
#             {"name": "Housing", "value": 30, "color": "#8B5CF6"},
#             {"name": "Food & Dining", "value": 25, "color": "#1D4ED8"},
#             {"name": "Transportation", "value": 16, "color": "#10B981"},
#             {"name": "Shopping", "value": 14, "color": "#F59E0B"},
#             {"name": "Healthcare", "value": 9, "color": "#EF4444"},
#             {"name": "Others", "value": 6, "color": "#64748B"},
#         ],
#         "trend": {
#             "labels": ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
#             "spending": [45000, 48000, 52000, 46000, 44000, 50200],
#             "budget": [50000, 50000, 50000, 50000, 50000, 50000],
#         },
#     }
#     return JsonResponse(data)
