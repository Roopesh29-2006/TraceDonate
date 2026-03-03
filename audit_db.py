from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.getcwd())

from models.payment import PaymentTransaction
from models.victim_request import VictimRequest
from models.proof_story import ProofStory

DATABASE_URL = "postgresql://tracedonate:tracedonate_secure_pass@localhost:5432/tracedonate"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def audit_stories():
    print("\n--- AUDIT: Victim Requests ---")
    requests = db.query(VictimRequest).all()
    for r in requests:
        print(f"Req ID: {r.id}, Title: {r.title}, Status: {r.status}, Raised: {r.collected_amount}/{r.required_amount}")

    print("\n--- AUDIT: Proof Stories ---")
    stories = db.query(ProofStory).all()
    for s in stories:
        print(f"Story ID: {s.id}, Req ID: {s.request_id}, Title: {s.title}, Media: {s.media_url}")

    print("\n--- AUDIT: Successful Transactions ---")
    txns = db.query(PaymentTransaction).filter(PaymentTransaction.status == "SUCCESS").all()
    for t in txns:
        print(f"Txn ID: {t.transaction_id}, Req ID: {t.request_id}, Trace: {t.trace_token}")

if __name__ == "__main__":
    audit_stories()
    db.close()
