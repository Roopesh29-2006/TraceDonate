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
from auth.auth_dependencies import get_current_user, require_role
from services.urgency_classifier import classify_urgency

router = APIRouter()


@router.post("/request", response_model=VictimRequestResponse, status_code=status.HTTP_201_CREATED)
def create_victim_request(
    request_data: VictimRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["VICTIM"]))
):
    """
    Create a new victim request.

    Args:
        request_data: Victim request data
        db: Database session
        current_user: Current authenticated victim

    Returns:
        Created victim request

    Raises:
        HTTPException: If user is not a victim
    """
    # Classify urgency
    urgency_level = classify_urgency(request_data.title, request_data.description)

    # Create new request
    new_request = VictimRequest(
        victim_id=current_user.id,
        title=request_data.title,
        description=request_data.description,
        required_amount=request_data.required_amount,
        urgency_level=urgency_level,
        status=RequestStatus.PENDING
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


@router.get("/request", response_model=VictimRequestListResponse)
def get_victim_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["VICTIM"])),
    skip: int = 0,
    limit: int = 10
):
    """
    Get all requests for current victim.

    Args:
        db: Database session
        current_user: Current authenticated victim
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of victim requests
    """
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


@router.get("/request/{request_id}", response_model=VictimRequestResponse)
def get_victim_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["VICTIM"]))
):
    """
    Get specific victim request details.

    Args:
        request_id: ID of the request
        db: Database session
        current_user: Current authenticated victim

    Returns:
        Victim request details

    Raises:
        HTTPException: If request not found or unauthorized
    """
    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id,
        VictimRequest.victim_id == current_user.id
    ).first()

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )

    return request


@router.put("/request/{request_id}", response_model=VictimRequestResponse)
def update_victim_request(
    request_id: int,
    request_data: VictimRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["VICTIM"]))
):
    """
    Update victim request (only pending requests).

    Args:
        request_id: ID of the request to update
        request_data: Updated request data
        db: Database session
        current_user: Current authenticated victim

    Returns:
        Updated victim request

    Raises:
        HTTPException: If request not found, unauthorized, or not pending
    """
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

    # Update fields
    if request_data.title:
        request.title = request_data.title
    if request_data.description:
        request.description = request_data.description
        # Reclassify urgency if description changed
        urgency_level = classify_urgency(request.title, request.description)
        request.urgency_level = urgency_level
    if request_data.required_amount:
        request.required_amount = request_data.required_amount

    db.commit()
    db.refresh(request)

    return request
