from django.db import models
import json


class Receipt(models.Model):
    image = models.ImageField(upload_to='receipts/')
    text_extracted = models.TextField(blank=True)  # Raw OCR result
    parsed_data = models.JSONField(blank=True, null=True)  # Structured data: {"items": [...], "total": float}
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receipt {self.id}"