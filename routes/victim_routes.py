"""
Victim routes - victim request management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.victim_request import VictimRequest, RequestStatus
from schemas.victim_request_schema import (
    VictimRequestCreate,
    VictimRequestUpdate,
    VictimRequestResponse,
    VictimRequestListResponse
)
from auth.auth_dependencies import require_role

# ML + AI services
from services.ml_model import predict_category, calculate_priority
from services.urgency_classifier import classify_urgency

router = APIRouter()


# ======================================================
# 🔹 CREATE REQUEST (WITH ML + AUTHORITY SYSTEM)
# ======================================================

@router.post("/request", response_model=VictimRequestResponse, status_code=status.HTTP_201_CREATED)
def create_victim_request(
    request_data: VictimRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["VICTIM"]))
):

    # 1️⃣ Urgency classification
    urgency_level = classify_urgency(
        request_data.title,
        request_data.description
    )

    # 2️⃣ ML Category
    predicted_category = predict_category(
    request_data.title,
    request_data.description
)
    predicted_category = str(predicted_category.item() if hasattr(predicted_category, "item") else predicted_category)
    
    # 3️⃣ AI Priority
    priority_score = calculate_priority(
        request_data.required_amount,
        urgency_level
    )

    # 4️⃣ Create DB object (WITH AUTHORITY FIELDS)
    new_request = VictimRequest(
        victim_id=current_user.id,
        title=request_data.title,
        description=request_data.description,
        required_amount=request_data.required_amount,
        latitude=request_data.latitude,
        longitude=request_data.longitude,
        location_name=request_data.location_name,

        urgency_level=urgency_level,
        category=predicted_category,
        priority_score=priority_score,

        authority_name=request_data.authority_name,
        authority_contact=request_data.authority_contact,
        authority_organization=request_data.authority_organization,
        authority_proof_url=request_data.authority_proof_url,
        is_verified_by_admin=False,

        status=RequestStatus.PENDING
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


# ======================================================
# 🔹 GET ALL REQUESTS (VICTIM)
# ======================================================

@router.get("/request", response_model=VictimRequestListResponse)
def get_victim_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["VICTIM"])),
    skip: int = 0,
    limit: int = 10
):
    requests = db.query(VictimRequest).filter(
        VictimRequest.victim_id == current_user.id
    ).offset(skip).limit(limit).all()

    total = db.query(VictimRequest).filter(
        VictimRequest.victim_id == current_user.id
    ).count()

    return {
        "total": total,
        "requests": requests
    }


# ======================================================
# 🔹 GET MAP DATA
# ======================================================

@router.get("/map")
def get_map_requests(db: Session = Depends(get_db)):

    requests = db.query(VictimRequest).filter(
        VictimRequest.status == RequestStatus.APPROVED
    ).all()

    return [
        {
            "id": r.id,
            "title": r.title,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "urgency": r.urgency_level,
            "required_amount": r.required_amount,
            "collected_amount": r.collected_amount,
            "category": r.category,
            "priority_score": r.priority_score
        }
        for r in requests
        if r.latitude and r.longitude
    ]


# ======================================================
# 🔹 UPDATE REQUEST (SAFE + ML RE-CALC)
# ======================================================

@router.put("/request/{request_id}", response_model=VictimRequestResponse)
def update_victim_request(
    request_id: int,
    request_data: VictimRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["VICTIM"]))
):

    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id,
        VictimRequest.victim_id == current_user.id
    ).first()

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )

    if request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update pending requests"
        )

    # Update allowed fields
    if request_data.title:
        request.title = request_data.title

    if request_data.description:
        request.description = request_data.description

    if request_data.required_amount:
        request.required_amount = request_data.required_amount

    # 🔥 Recalculate ML fields
    request.urgency_level = classify_urgency(
        request.title,
        request.description
    )

    request.category = predict_category(
        request.title,
        request.description
    )

    request.priority_score = calculate_priority(
        request.required_amount,
        request.urgency_level
    )

    db.commit()
    db.refresh(request)

    return request


# ======================================================
# 🔹 GET MY REQUESTS (SIMPLIFIED)
# ======================================================

@router.get("/my-requests")
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["VICTIM"]))
):

    requests = db.query(VictimRequest).filter(
        VictimRequest.victim_id == current_user.id
    ).all()

    return [
    {
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "required_amount": float(r.required_amount),
        "collected_amount": float(r.collected_amount),
        "status": r.status.value if hasattr(r.status, "value") else r.status,
        "category": r.category,
        "priority_score": r.priority_score,

        # 🔥 ADD THESE BELOW
        "authority_name": r.authority_name,
        "authority_contact": r.authority_contact,
        "authority_organization": r.authority_organization,
        "authority_proof_url": r.authority_proof_url,
        "is_verified_by_admin": r.is_verified_by_admin,
    }
    for r in requests
]
@router.put("/submit-completion/{request_id}")
def submit_completion(
    request_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["VICTIM"]))
):

    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id,
        VictimRequest.victim_id == current_user.id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.collected_amount < request.required_amount:
        raise HTTPException(
            status_code=400,
            detail="Funding not completed yet"
        )

    request.completion_story = data.get("story")
    request.completion_proof_url = data.get("proof_url")
    request.status = RequestStatus.COMPLETED

    db.commit()
    db.refresh(request)

    return {"message": "Completion story submitted successfully"}