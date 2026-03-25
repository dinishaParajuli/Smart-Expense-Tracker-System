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
    category = models.CharField(max_length=100, default='Savings')
    notes = models.TextField(blank=True, default='')

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


class Budget(models.Model):
    PERIOD_CHOICES = (
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES, default='monthly')
    spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    color = models.CharField(max_length=50, default='bg-blue-500')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'category', 'period')

    def __str__(self):
        return f"{self.user.username} - {self.category} ({self.period})"

    def get_spent_amount(self):
        """Calculate spent amount from transactions"""
        from django.utils import timezone
        from datetime import timedelta

        today = timezone.now().date()
        
        if self.period == 'weekly':
            start_date = today - timedelta(days=today.weekday())
        elif self.period == 'monthly':
            start_date = today.replace(day=1)
        else:  # yearly
            start_date = today.replace(month=1, day=1)
        
        spent = Transaction.objects.filter(
            user=self.user,
            category=self.category,
            type='expense',
            date__gte=start_date
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        
        return float(spent)
