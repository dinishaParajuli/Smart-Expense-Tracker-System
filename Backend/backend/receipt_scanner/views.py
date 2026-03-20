from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Receipt
from .serializers import ReceiptSerializer
from .forms import ReceiptUploadForm
from .utils.ocr_utils import process_receipt
from accounts.models import Transaction


class ReceiptViewSet(viewsets.ModelViewSet):
    """CRUD viewset for receipts with OCR scanning."""

    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

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
            payload = serializer.data
            payload["transaction_created"] = None
            return Response(payload, status=status.HTTP_201_CREATED)

        except ValueError as e:
            # Delete the receipt if OCR fails
            receipt.delete()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Delete the receipt if something else fails
            receipt.delete()
            return Response({"error": "An unexpected error occurred during scanning."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def store(self, request, pk=None):
        """
        Store scanned receipt total into Transaction table on explicit user action.
        """
        receipt = self.get_object()
        parsed_data = receipt.parsed_data or {}
        total_amount = parsed_data.get("total")

        if total_amount is None:
            return Response(
                {"error": "No total amount found in this receipt."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        notes = f"Auto-created from scanned receipt #{receipt.id}"
        existing_txn = Transaction.objects.filter(user=request.user, notes=notes).order_by("-id").first()
        if existing_txn:
            return Response(
                {
                    "message": "This receipt is already stored.",
                    "transaction_created": existing_txn.id,
                },
                status=status.HTTP_200_OK,
            )

        created_transaction = Transaction.objects.create(
            user=request.user,
            type="expense",
            amount=total_amount,
            category="Receipt Scan",
            payment_method="Cash",
            date=timezone.now().date(),
            notes=notes,
        )

        return Response(
            {
                "message": "Receipt stored successfully.",
                "transaction_created": created_transaction.id,
            },
            status=status.HTTP_201_CREATED,
        )
