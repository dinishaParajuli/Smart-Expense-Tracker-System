from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import User

class User(AbstractUser):

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return self.username

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    saved_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deadline = models.DateField()

    def progress(self):
        return (self.saved_amount / self.target_amount) * 100


class Challenge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    progress = models.IntegerField(default=0)
    total = models.IntegerField(default=100)
    reward_points = models.IntegerField(default=0)
    days_left = models.IntegerField(default=0)


class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('Cash', 'Cash'),
        ('Credit Card', 'Credit Card'),
        ('Debit Card', 'Debit Card'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Digital Wallet', 'Digital Wallet'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='Cash')
    date = models.DateField()
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.type} - {self.amount}"
