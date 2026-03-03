import qrcode
import base64
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from typing import Dict, Any

class PaymentService:
    @staticmethod
    def generate_upi_qr(upi_id: str, amount: float, transaction_id: str, payee_name: str = "TraceDonate") -> str:
        """
        Generate a base64 encoded QR code for UPI payment.
        """
        # UPI string format
        # upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR&tr=TXN_ID
        upi_url = f"upi://pay?pa={upi_id}&pn={payee_name}&am={amount:.2f}&cu=INR&tr={transaction_id}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(upi_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return f"data:image/png;base64,{img_str}"

    @staticmethod
    def generate_receipt_pdf(transaction_data: Dict[str, Any]) -> str:
        """
        Generate a base64 encoded PDF receipt using reportlab.
        """
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Header
        c.setFont("Helvetica-Bold", 24)
        c.drawString(50, height - 80, "TraceDonate")
        c.setFont("Helvetica", 12)
        c.setFillColor(colors.gray)
        c.drawString(50, height - 100, "Transparent AI-Powered Donation Platform")

        # Title
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(50, height - 140, "Donation Receipt")

        # Receipt ID & Date
        c.setFont("Helvetica", 12)
        c.drawString(50, height - 170, f"Receipt No: {transaction_data.get('transaction_id', 'N/A')}")
        c.drawString(400, height - 170, f"Date: {transaction_data.get('date', 'N/A')}")

        # Donor & Campaign Info
        c.drawString(50, height - 210, f"Donor Name: {transaction_data.get('donor_name', 'N/A')}")
        c.drawString(50, height - 230, f"Campaign: {transaction_data.get('campaign_name', 'N/A')}")
        c.drawString(50, height - 250, f"Payment Method: {transaction_data.get('payment_method', 'N/A')}")
        
        # Amount
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, height - 290, f"Amount Donated: ₹{float(transaction_data.get('amount', 0)):.2f}")

        # Footer / Seal
        c.setFont("Helvetica-Oblique", 10)
        c.setFillColor(colors.green)
        c.drawString(50, height - 350, "✓ Verified by TraceDonate Platform")
        c.setFillColor(colors.gray)
        c.drawString(50, height - 370, "This is a computer-generated receipt and does not require a physical signature.")

        c.save()
        
        pdf_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return pdf_str
