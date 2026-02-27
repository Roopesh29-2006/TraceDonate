"""
Donation routes - donation management and tracking endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.donation import Donation, DonationStatus
from models.victim_request import VictimRequest, RequestStatus
from models.proof_story import ProofStory
from schemas.donation_schema import DonationCreate, DonationResponse, DonationTrack
from auth.auth_dependencies import get_current_user
from services.trace_token_generator import generate_trace_token

router = APIRouter()


@router.post("/create", response_model=DonationResponse, status_code=status.HTTP_201_CREATED)
def create_donation(
    donation_data: DonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new donation.

    Args:
        donation_data: Donation creation data
        db: Database session
        current_user: Current authenticated donor

    Returns:
        Created donation record

    Raises:
        HTTPException: If request not found or not approved
    """
    # Verify request exists and is approved
    request = db.query(VictimRequest).filter(
        VictimRequest.id == donation_data.request_id
    ).first()

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Victim request not found"
        )

    if request.status != RequestStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only donate to approved requests"
        )

    # Generate unique trace token
    trace_token = generate_trace_token()

    # Create donation
    donation = Donation(
        donor_id=current_user.id,
        request_id=donation_data.request_id,
        amount=donation_data.amount,
        trace_token=trace_token,
        payment_id=donation_data.payment_id,
        status=DonationStatus.COMPLETED
    )

    # Update collected amount
    request.collected_amount += donation_data.amount

    # Mark request as completed if target reached
    if request.collected_amount >= request.required_amount:
        request.status = RequestStatus.COMPLETED

    db.add(donation)
    db.commit()
    db.refresh(donation)

    return donation


@router.get("/track/{trace_token}", response_model=DonationTrack)
def track_donation(
    trace_token: str,
    db: Session = Depends(get_db)
):
    """
    Track donation by trace token.

    Args:
        trace_token: Unique trace token of the donation
        db: Database session

    Returns:
        Donation tracking information with proof stories

    Raises:
        HTTPException: If donation not found
    """
    # Find donation
    donation = db.query(Donation).filter(
        Donation.trace_token == trace_token
    ).first()

    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found"
        )

    # Get related data
    donor = donation.donor
    request = donation.request
    proof_stories = db.query(ProofStory).filter(
        ProofStory.request_id == request.id
    ).all()

    # Format proof stories
    proof_stories_data = [
        {
            "description": story.description,
            "media_url": story.media_url,
            "created_at": story.created_at
        }
        for story in proof_stories
    ]

    return {
        "trace_token": donation.trace_token,
        "donor_name": donor.name,
        "request_title": request.title,
        "amount": donation.amount,
        "status": donation.status,
        "created_at": donation.created_at,
        "proof_stories": proof_stories_data
    }


@router.get("/my-donations", response_model=dict)
def get_my_donations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 10
):
    """
    Get all donations made by current user.

    Args:
        db: Database session
        current_user: Current authenticated user
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of user's donations
    """
    donations = db.query(Donation).filter(
        Donation.donor_id == current_user.id
    ).order_by(Donation.created_at.desc()).offset(skip).limit(limit).all()

    total = db.query(Donation).filter(
        Donation.donor_id == current_user.id
    ).count()

    return {
        "total": total,
        "donations": donations
    }
