"""
Donation routes - FINAL stable JSON-body version
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from database import get_db
from auth.auth_dependencies import require_role
from services.distance_service import calculate_distance
from models.donation import Donation, DonationStatus
from models.victim_request import VictimRequest, RequestStatus
from models.user import User

router = APIRouter()


# ======================================================
# 🔹 REQUEST MODELS (IMPORTANT FOR 422 FIX)
# ======================================================

class CreateOrderRequest(BaseModel):
    request_id: int
    amount: float


class ConfirmPaymentRequest(BaseModel):
    donation_id: int


# ======================================================
# 🔹 GET APPROVED REQUESTS FOR DONORS
# ======================================================

@router.get("/available-requests")
def available_requests(
    donor_lat: float,
    donor_lon: float,
    db: Session = Depends(get_db)
):

    requests = db.query(VictimRequest).filter(
        VictimRequest.status == RequestStatus.APPROVED
    ).all()

    result = []

    for r in requests:
        if r.latitude and r.longitude:
            distance = calculate_distance(
                donor_lat,
                donor_lon,
                r.latitude,
                r.longitude
            )
        else:
            distance = 9999  # push to end if no location

        result.append({
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "required_amount": float(r.required_amount),
            "collected_amount": float(r.collected_amount),
            "priority_score": r.priority_score,
            "category": r.category,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "distance_km": round(distance, 2)
        })

    # Sort by nearest first
    result.sort(key=lambda x: x["distance_km"])

    return {"requests": result}


# ======================================================
# 🔹 CREATE DONATION ORDER (JSON BODY)
# ======================================================

@router.post("/create-order")
def create_order(
    payload: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["DONOR"]))
):

    request_id = payload.request_id
    amount = payload.amount

    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id,
        VictimRequest.status == RequestStatus.APPROVED
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not available")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    remaining = float(request.required_amount) - float(request.collected_amount)

    if amount > remaining:
        raise HTTPException(
            status_code=400,
            detail=f"Only ₹{remaining} remaining"
        )

    donation = Donation(
        donor_id=current_user.id,
        request_id=request_id,
        amount=amount,
        status=DonationStatus.PENDING
    )

    db.add(donation)
    db.commit()
    db.refresh(donation)
    return {
    "donation_id": donation.id,
    "payment_session_id": str(uuid.uuid4()),
    "amount": payload.amount
}

# ======================================================
# 🔹 CONFIRM DONATION PAYMENT (JSON BODY)
# ======================================================

@router.post("/confirm-payment")
def confirm_payment(
    payload: ConfirmPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["DONOR"]))
):

    donation_id = payload.donation_id

    donation = db.query(Donation).filter(
        Donation.id == donation_id,
        Donation.donor_id == current_user.id
    ).first()

    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if donation.status != DonationStatus.PENDING:
        raise HTTPException(status_code=400, detail="Invalid donation state")

    request = db.query(VictimRequest).filter(
        VictimRequest.id == donation.request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    donation.status = DonationStatus.COMPLETED
    donation.trace_token = str(uuid.uuid4())

    request.collected_amount = float(request.collected_amount) + float(donation.amount)

    if request.collected_amount >= request.required_amount:
        request.status = RequestStatus.COMPLETED

    db.commit()

    return {
        "message": "Payment confirmed",
        "trace_token": donation.trace_token
    }


# ======================================================
# 🔹 DONATION PROGRESS
# ======================================================

@router.get("/progress/{request_id}")
def donation_progress(request_id: int, db: Session = Depends(get_db)):

    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    percentage = 0
    if request.required_amount > 0:
        percentage = (
            float(request.collected_amount)
            / float(request.required_amount)
        ) * 100

    return {
        "required_amount": float(request.required_amount),
        "collected_amount": float(request.collected_amount),
        "remaining_amount": float(request.required_amount) - float(request.collected_amount),
        "percentage_funded": round(percentage, 2),
        "status": request.status.value if hasattr(request.status, "value") else request.status
    }