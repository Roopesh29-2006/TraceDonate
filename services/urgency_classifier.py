"""
Urgency classifier service using keyword scoring.
"""
from models.victim_request import UrgencyLevel


# Keyword mappings for urgency classification
URGENCY_KEYWORDS = {
    UrgencyLevel.CRITICAL: [
        "icu",
        "ventilator",
        "emergency",
        "life support",
        "critical",
        "intensive care",
        "life threatening",
        "immediate",
        "urgent surgery",
    ],
    UrgencyLevel.HIGH: [
        "surgery",
        "cancer",
        "accident",
        "trauma",
        "severe",
        "hospitalization",
        "severe injury",
        "critical condition",
    ],
    UrgencyLevel.MEDIUM: [
        "treatment",
        "repair",
        "medication",
        "therapy",
        "procedure",
        "medical care",
    ],
    UrgencyLevel.LOW: [
        "education",
        "support",
        "assistance",
        "help",
        "training",
        "rehabilitation",
    ],
}


def classify_urgency(title: str, description: str) -> UrgencyLevel:
    """
    Classify urgency level based on keywords in title and description.

    Uses a scoring system where presence of keywords increases the urgency score.
    Higher urgency keywords have higher weights.

    Args:
        title: Title of the victim request
        description: Description of the victim request

    Returns:
        UrgencyLevel enum value (CRITICAL, HIGH, MEDIUM, LOW)
    """
    # Combine text for analysis
    text = (title + " " + description).lower()

    # Score calculation
    scores = {level: 0 for level in UrgencyLevel}

    # Calculate scores based on keyword matches
    for level, keywords in URGENCY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                # Critical keywords get higher weight
                if level == UrgencyLevel.CRITICAL:
                    scores[level] += 3
                elif level == UrgencyLevel.HIGH:
                    scores[level] += 2
                elif level == UrgencyLevel.MEDIUM:
                    scores[level] += 1
                else:
                    scores[level] += 0.5

    # Determine urgency level based on highest score
    if scores[UrgencyLevel.CRITICAL] > 0:
        return UrgencyLevel.CRITICAL
    elif scores[UrgencyLevel.HIGH] > 0:
        return UrgencyLevel.HIGH
    elif scores[UrgencyLevel.MEDIUM] > 0:
        return UrgencyLevel.MEDIUM
    else:
        return UrgencyLevel.LOW
