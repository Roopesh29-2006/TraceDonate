from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth.auth_dependencies import require_role
from models.victim_request import VictimRequest, RequestStatus
from models.user import User

router = APIRouter()


# ======================================================
# 🔹 GET ALL PENDING REQUESTS
# ======================================================
@router.get("/pending-requests")
def get_pending_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):

    requests = db.query(VictimRequest).filter(
        VictimRequest.status == RequestStatus.PENDING
    ).all()

    return [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "required_amount": float(r.required_amount),
            "collected_amount": float(r.collected_amount),
            "status": r.status.value if hasattr(r.status, "value") else r.status,
        }
        for r in requests
    ]
@router.get("/all-requests")
def get_all_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    requests = db.query(VictimRequest).all()

    return {
        "requests": requests
    }


# ======================================================
# 🔹 APPROVE REQUEST
# ======================================================
@router.put("/approve/{request_id}")
def approve_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):

    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    request.status = RequestStatus.APPROVED
    db.commit()

    return {"message": "Request approved"}


# ======================================================
# 🔹 REJECT REQUEST
# ======================================================
@router.put("/reject/{request_id}")
def reject_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):

    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    request.status = RequestStatus.REJECTED
    db.commit()

    return {"message": "Request rejected"}

@router.put("/verify-request/{request_id}")
def verify_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    request.is_verified_by_admin = True
    request.status = RequestStatus.APPROVED

    db.commit()

    return {"message": "Request verified and approved"}
# ======================================================
# 🔹 GET ALL PENDING REQUESTS (ADMIN)
# ======================================================

@router.get("/pending-requests")
def get_pending_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    requests = db.query(VictimRequest).filter(
        VictimRequest.status == RequestStatus.PENDING
    ).all()

    return [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "required_amount": r.required_amount,
            "priority_score": r.priority_score,
            "location_name": r.location_name,

            # Authority details
            "authority_name": r.authority_name,
            "authority_contact": r.authority_contact,
            "authority_organization": r.authority_organization,
            "authority_proof_url": r.authority_proof_url,

            "created_at": r.created_at
        }
        for r in requests
    ]
# ======================================================
# 🔹 GET ALL PENDING REQUESTS (ADMIN)
# ======================================================

@router.get("/pending-requests")
def get_pending_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    requests = db.query(VictimRequest).filter(
        VictimRequest.status == RequestStatus.PENDING
    ).all()

    return [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "required_amount": r.required_amount,
            "priority_score": r.priority_score,
            "location_name": r.location_name,

            # Authority details
            "authority_name": r.authority_name,
            "authority_contact": r.authority_contact,
            "authority_organization": r.authority_organization,
            "authority_proof_url": r.authority_proof_url,

            "created_at": r.created_at
        }
        for r in requests
    ]