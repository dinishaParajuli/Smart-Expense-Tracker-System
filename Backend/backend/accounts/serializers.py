from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Goal, Challenge, Transaction, Budget

#  Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='user', required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'user')
        )
        return user


#  Login Serializer
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(
            username=data['username'],
            password=data['password']
        )

        if not user:
            raise serializers.ValidationError("Invalid Credentials")

        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'role': user.role,
            'is_staff': user.is_staff
        }


#  User CRUD Serializer
class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'role',
            'is_active',
            'date_joined',
            'last_login',
        ]

class GoalSerializer(serializers.ModelSerializer):
    target = serializers.DecimalField(source='target_amount', max_digits=10, decimal_places=2)
    current = serializers.DecimalField(source='saved_amount', max_digits=10, decimal_places=2, required=False)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = ['id', 'title', 'target', 'current', 'deadline', 'category', 'notes', 'progress']

    def get_progress(self, obj):
        if not obj.target_amount:
            return 0
        return float((obj.saved_amount / obj.target_amount) * 100)


class ChallengeSerializer(serializers.ModelSerializer):
    reward = serializers.IntegerField(source='reward_points', required=False)
    daysLeft = serializers.IntegerField(source='days_left', required=False)
    completed = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = ['id', 'title', 'description', 'progress', 'total', 'reward', 'daysLeft', 'completed']

    def get_completed(self, obj):
        return obj.progress >= obj.total

# ForgotPasswordSection
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'type', 'amount', 'category', 'payment_method', 'date', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)


class BudgetSerializer(serializers.ModelSerializer):
    spent = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ['id', 'name', 'category', 'amount', 'period', 'spent', 'color', 'created_at', 'updated_at']
        read_only_fields = ['id', 'spent', 'created_at', 'updated_at']

    def get_spent(self, obj):
        """Get the actual spent amount from transactions"""
        return obj.get_spent_amount()