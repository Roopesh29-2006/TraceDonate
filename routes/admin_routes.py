"""
Admin routes - admin management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.victim_request import VictimRequest, RequestStatus
from schemas.victim_request_schema import VictimRequestResponse, VictimRequestListResponse
from auth.auth_dependencies import get_current_user, require_role

router = APIRouter()


@router.get("/requests", response_model=VictimRequestListResponse)
def get_all_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"])),
    status_filter: str = None,
    skip: int = 0,
    limit: int = 20
):
    """
    Get all victim requests (admin only).

    Args:
        db: Database session
        current_user: Current authenticated admin
        status_filter: Filter by status (PENDING, APPROVED, REJECTED, COMPLETED)
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of all victim requests
    """
    query = db.query(VictimRequest)

    # Apply status filter if provided
    if status_filter:
        valid_statuses = [status.value for status in RequestStatus]
        if status_filter not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        query = query.filter(VictimRequest.status == status_filter)

    # Order by pinned first, then by urgency, then by created_at
    requests = query.order_by(
        VictimRequest.is_pinned.desc(),
        VictimRequest.created_at.desc()
    ).offset(skip).limit(limit).all()

    total = db.query(VictimRequest)
    if status_filter:
        total = total.filter(VictimRequest.status == status_filter)
    total = total.count()

    return {
        "total": total,
        "requests": requests
    }


@router.post("/approve/{request_id}", response_model=VictimRequestResponse)
def approve_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """
    Approve a victim request (admin only).

    Args:
        request_id: ID of the request to approve
        db: Database session
        current_user: Current authenticated admin

    Returns:
        Approved victim request

    Raises:
        HTTPException: If request not found or already processed
    """
    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )

    if request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request is already {request.status}"
        )

    request.status = RequestStatus.APPROVED
    db.commit()
    db.refresh(request)

    return request


@router.post("/reject/{request_id}", response_model=VictimRequestResponse)
def reject_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """
    Reject a victim request (admin only).

    Args:
        request_id: ID of the request to reject
        db: Database session
        current_user: Current authenticated admin

    Returns:
        Rejected victim request

    Raises:
        HTTPException: If request not found or already processed
    """
    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )

    if request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request is already {request.status}"
        )

    request.status = RequestStatus.REJECTED
    db.commit()
    db.refresh(request)

    return request


@router.post("/pin/{request_id}", response_model=VictimRequestResponse)
def pin_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """
    Pin a victim request (admin only).
    Pinned requests appear at the top of the list.

    Args:
        request_id: ID of the request to pin
        db: Database session
        current_user: Current authenticated admin

    Returns:
        Pinned victim request

    Raises:
        HTTPException: If request not found
    """
    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )

    request.is_pinned = True
    db.commit()
    db.refresh(request)

    return request


@router.post("/unpin/{request_id}", response_model=VictimRequestResponse)
def unpin_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """
    Unpin a victim request (admin only).

    Args:
        request_id: ID of the request to unpin
        db: Database session
        current_user: Current authenticated admin

    Returns:
        Unpinned victim request

    Raises:
        HTTPException: If request not found
    """
    request = db.query(VictimRequest).filter(
        VictimRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )

    request.is_pinned = False
    db.commit()
    db.refresh(request)

    return request
