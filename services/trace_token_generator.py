"""
Trace token generator for unique donation tracking.
"""
import uuid


def generate_trace_token() -> str:
    """
    Generate a unique trace token for donation tracking.

    Format: TRACE-XXXXXXXX where X is a uppercase hex character
    Example: TRACE-A7F9B2C1

    Returns:
        Unique trace token string
    """
    # Generate UUID and extract first 8 characters
    unique_id = str(uuid.uuid4().hex[:8]).upper()
    return f"TRACE-{unique_id}"
