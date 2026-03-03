from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth.auth_dependencies import require_role
from models.victim_request import VictimRequest, RequestStatus
from models.user import User

router = APIRouter()

def serialize_request(r: VictimRequest) -> dict:
    """Helper to safely serialize VictimRequest objects to JSON."""
    return {
        "id": getattr(r, 'id'),
        "title": getattr(r, 'title'),
        "description": getattr(r, 'description'),
        "required_amount": float(getattr(r, 'required_amount', 0)),
        "collected_amount": float(getattr(r, 'collected_amount', 0)),
        "status": str(getattr(r, 'status', 'PENDING')),
        "priority_score": getattr(r, 'priority_score', 0),
        "location_name": getattr(r, 'location_name', ''),
        "authority_name": getattr(r, 'authority_name', ''),
        "authority_contact": getattr(r, 'authority_contact', ''),
        "authority_organization": getattr(r, 'authority_organization', ''),
        "authority_proof_url": getattr(r, 'authority_proof_url', ''),
        "created_at": getattr(r, 'created_at').isoformat() if hasattr(getattr(r, 'created_at'), 'isoformat') else str(getattr(r, 'created_at'))
    }

# ======================================================
# 🔹 GET ALL PENDING REQUESTS
# ======================================================
@router.get("/pending-requests")
def get_pending_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    # Using filter_by is more IDE-friendly than filter() with comparisons
    requests = db.query(VictimRequest).filter_by(status=RequestStatus.PENDING).all()
    v_requests: list[VictimRequest] = requests
    return [serialize_request(r) for r in v_requests]

# ======================================================
# 🔹 GET ALL REQUESTS
# ======================================================
@router.get("/all-requests")
def get_all_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    requests = db.query(VictimRequest).all()
    v_requests: list[VictimRequest] = requests
    return {
        "requests": [serialize_request(r) for r in v_requests]
    }

# ======================================================
# 🔹 VERIFY REQUEST (APPROVE/REJECT)
# ======================================================
@router.put("/verify-request/{request_id}")
def verify_request(
    request_id: int,
    approve: bool,  # Taken from query param ?approve=true/false
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    request = db.query(VictimRequest).filter_by(id=request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    v_req: VictimRequest = request
    if approve:
        setattr(v_req, 'is_verified_by_admin', True)
        setattr(v_req, 'status', RequestStatus.APPROVED)
        msg = "Request verified and approved"
    else:
        setattr(v_req, 'status', RequestStatus.REJECTED)
        msg = "Request rejected"

    db.commit()
    return {"message": msg}

# Simple status update endpoints (for backward compatibility)
@router.put("/approve/{request_id}")
def approve_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role(["ADMIN"]))):
    request = db.query(VictimRequest).filter_by(id=request_id).first()
    if not request: raise HTTPException(status_code=404, detail="Request not found")
    v_req: VictimRequest = request
    setattr(v_req, 'status', RequestStatus.APPROVED)
    db.commit()
    return {"message": "Request approved"}

@router.put("/reject/{request_id}")
def reject_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role(["ADMIN"]))):
    request = db.query(VictimRequest).filter_by(id=request_id).first()
    if not request: raise HTTPException(status_code=404, detail="Request not found")
    v_req: VictimRequest = request
    setattr(v_req, 'status', RequestStatus.REJECTED)
    db.commit()
    return {"message": "Request rejected"}