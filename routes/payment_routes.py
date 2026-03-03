from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
import uuid
from datetime import datetime
import base64

from database import get_db
from auth.auth_dependencies import require_role
from models.user import User
from models.victim_request import VictimRequest, RequestStatus
from models.payment import PaymentTransaction, PaymentMethod, PaymentStatus
from services.payment_service import PaymentService
from schemas.payment_schema import PaymentIntentRequest, PaymentIntentResponse, PaymentConfirmRequest, PaymentConfirmResponse

router = APIRouter()

# ======================================================
# 🔹 CREATE PAYMENT INTENT
# ======================================================

@router.post("/intent", response_model=PaymentIntentResponse)
def create_payment_intent(
    payload: PaymentIntentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["DONOR"]))
):
    # 1. Verify Request
    request = db.query(VictimRequest).filter(
        VictimRequest.id == payload.request_id,
        VictimRequest.status == RequestStatus.APPROVED,
        VictimRequest.is_verified_by_admin == True
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found or not approved")

    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    remaining = float(request.required_amount) - float(request.collected_amount)
    if payload.amount > remaining:
        raise HTTPException(status_code=400, detail=f"Only ₹{remaining} remaining to be funded")

    # 2. Assign Transaction ID
    tx_string = str(uuid.uuid4()).replace('-', '').upper()
    tx_id = f"TXN-{tx_string[0:12]}"

    # 3. Handle Method
    try:
        method = PaymentMethod(payload.payment_method.upper())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payment method. Use UPI or CARD.")

    # 4. Create Transaction Record
    transaction = PaymentTransaction(
        donor_id=current_user.id,
        request_id=request.id,
        amount=payload.amount,
        payment_method=method,
        transaction_id=tx_id,
        status=PaymentStatus.PENDING
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # 5. Generate QR if UPI
    qr_code_base64 = None
    if method == PaymentMethod.UPI:
        # Generate QR code for simulated UPI
        payee_name = f"Campaign {request.id}"
        qr_code_base64 = PaymentService.generate_upi_qr(
            upi_id="trace-donate@upi", 
            amount=float(payload.amount), 
            transaction_id=tx_id,
            payee_name=payee_name
        )

    return PaymentIntentResponse(
        transaction_id=tx_id,
        amount=payload.amount,
        payment_method=method.value,
        qr_code_base64=qr_code_base64,
        status=PaymentStatus.PENDING.value
    )


# ======================================================
# 🔹 CONFIRM PAYMENT
# ======================================================

@router.post("/confirm", response_model=PaymentConfirmResponse)
def confirm_payment(
    payload: PaymentConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["DONOR"]))
):
    # 1. Fetch Transaction
    transaction = db.query(PaymentTransaction).filter(
        PaymentTransaction.transaction_id == payload.transaction_id,
        PaymentTransaction.donor_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.status != PaymentStatus.PENDING:
        raise HTTPException(status_code=400, detail="Transaction is not pending")

    # 2. Fetch Request and Double Check Bounds
    request = db.query(VictimRequest).filter(
        VictimRequest.id == transaction.request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Associated request not found")

    remaining = float(request.required_amount) - float(request.collected_amount)
    if transaction.amount > remaining:
        # Partial fail simulation if somehow concurrent transactions exceeded
        transaction.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(status_code=400, detail="Payment declined. Campaign amount already met.")

    # 3. Finalize Payment
    # In real world, we verify a webhook or payment gateway API here. For simulation, assume success.
    transaction.status = PaymentStatus.SUCCESS
    token_str = str(uuid.uuid4()).replace('-', '').upper()
    transaction.trace_token = f"TRACE-{token_str[0:10]}"

    # 4. Update Victim Request
    request.collected_amount = float(request.collected_amount) + float(transaction.amount)
    
    # NOTE: Even if fully funded, keep status APPROVED based on user requirements.
    # The victim must submit completion proof manually.

    # 5. Commit
    db.commit()

    receipt_url = f"/payments/receipt/{transaction.transaction_id}"

    return PaymentConfirmResponse(
        status="SUCCESS",
        message="Payment confirmed successfully",
        receipt_url=receipt_url,
        trace_token=transaction.trace_token
    )


# ======================================================
# 🔹 TRACE DONATION IMPACT
# ======================================================

@router.get("/trace/{token}")
def get_trace_impact(token: str, db: Session = Depends(get_db)):
    # 1. Fetch Transaction (Case-insensitive search)
    search_token = token.strip().upper()
    transaction = db.query(PaymentTransaction).filter(
        or_(
            PaymentTransaction.trace_token == search_token,
            PaymentTransaction.transaction_id == search_token
        ),
        PaymentTransaction.status == PaymentStatus.SUCCESS
    ).first()

    if not transaction:
        # Check if the transaction exists but is just PENDING
        pending_txn = db.query(PaymentTransaction).filter(
            or_(
                PaymentTransaction.trace_token == search_token,
                PaymentTransaction.transaction_id == search_token
            )
        ).first()

        if pending_txn:
            raise HTTPException(status_code=400, detail="Payment is still pending verification. Please try again soon.")
        
        raise HTTPException(status_code=404, detail="Donation track not found. Please check your token or transaction ID.")

    # 2. Fetch Request and Donor
    request = db.query(VictimRequest).filter(VictimRequest.id == transaction.request_id).first()
    donor = db.query(User).filter(User.id == transaction.donor_id).first()

    # 3. Fetch Proof Stories (if any)
    proofs = []
    if request and hasattr(request, 'proof_stories'):
        for p in request.proof_stories:
            proofs.append({
                "title": p.title or "Impact Story",
                "description": p.description or "",
                "media_url": p.media_url or "",
                "date": p.created_at.strftime("%Y-%m-%d") if p.created_at else "Recently",
                "is_verified": p.is_verified
            })

    # 4. Calculate Progress (Ensure it's a number)
    try:
        req_needed = float(request.required_amount) if request else 0
        req_collected = float(request.collected_amount) if request else 0
        percentage = (req_collected / req_needed) * 100 if req_needed > 0 else 0
    except (TypeError, ValueError, AttributeError):
        percentage = 0
        req_needed = 0
        req_collected = 0

    return {
        "_debug": "TRACE_V3_STABLE",
        "transaction": {
            "id": transaction.transaction_id,
            "transaction_id": transaction.transaction_id,  # Legacy key support
            "amount": float(transaction.amount or 0),
            "date": transaction.created_at.strftime("%Y-%m-%d %H:%M:%S") if transaction.created_at else "N/A",
            "method": str(transaction.payment_method.value if hasattr(transaction.payment_method, 'value') else transaction.payment_method)
        },
        "campaign": {
            "id": request.id if request else 0,
            "title": request.title if request else "Unknown Campaign",
            "status": str(request.status.value if hasattr(request.status, 'value') else request.status) if request else "N/A",
            "collected": float(request.collected_amount or 0) if request else 0,
            "required": float(request.required_amount or 0) if request else 0,
            "progress": round(percentage, 2)
        },
        "donor_name": donor.name if donor else "Anonymous",
        "impact_stories": proofs
    }
