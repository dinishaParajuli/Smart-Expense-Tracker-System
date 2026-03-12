from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

from .models import Receipt
from .serializers import ReceiptSerializer
from .forms import ReceiptUploadForm
from .utils.ocr_utils import process_receipt


class ReceiptViewSet(viewsets.ModelViewSet):
    """CRUD viewset for receipts with OCR scanning."""

    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer

    @action(detail=False, methods=['post'])
    def scan(self, request):
        """
        Upload an image and perform OCR scanning.
        """
        form = ReceiptUploadForm(request.POST, request.FILES)
        if not form.is_valid():
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

        # Save the receipt instance
        receipt = form.save()

        try:
            # Get the image path
            image_path = receipt.image.path

            # Process OCR
            text_extracted, parsed_data = process_receipt(image_path)

            # Update the receipt with OCR results
            receipt.text_extracted = text_extracted
            receipt.parsed_data = parsed_data
            receipt.save()

            # Serialize and return
            serializer = self.get_serializer(receipt)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            # Delete the receipt if OCR fails
            receipt.delete()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Delete the receipt if something else fails
            receipt.delete()
            return Response({"error": "An unexpected error occurred during scanning."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
