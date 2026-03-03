from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker
import sys
import os

# Set up paths to import models
sys.path.append(os.getcwd())

from models.payment import PaymentTransaction
from models.victim_request import VictimRequest
from models.proof_story import ProofStory

DATABASE_URL = "postgresql://tracedonate:tracedonate_secure_pass@localhost:5432/tracedonate"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def check_trace(token):
    print(f"\n--- Checking Token: {token} ---")
    txn = db.query(PaymentTransaction).filter(
        or_(
            PaymentTransaction.trace_token == token,
            PaymentTransaction.transaction_id == token
        )
    ).first()
    
    if not txn:
        print("❌ Transaction NOT found in DB.")
        return

    print(f"✅ Transaction found: ID={txn.id}, TransID={txn.transaction_id}, Status={txn.status}, ReqID={txn.request_id}")
    
    req = db.query(VictimRequest).filter(VictimRequest.id == txn.request_id).first()
    if req:
        print(f"✅ Request found: ID={req.id}, Title={req.title}, Collected={req.collected_amount}, Status={req.status}")
        
        proofs = db.query(ProofStory).filter(ProofStory.request_id == req.id).all()
        print(f"📄 Found {len(proofs)} ProofStories for this request.")
        for p in proofs:
            print(f"  - Story: {p.title}, Media: {p.media_url}, Verified: {p.is_verified}")
    else:
        print("❌ Associated VictimRequest NOT found.")

if __name__ == "__main__":
    check_trace("TXN-A9E54D7064C6")
    db.close()
