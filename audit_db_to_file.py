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

with open("audit_results.txt", "w", encoding="utf-8") as f:
    f.write("\n--- AUDIT: Victim Requests ---\n")
    requests = db.query(VictimRequest).all()
    for r in requests:
        f.write(f"Req ID: {r.id}, Title: {r.title}, Status: {r.status}, Raised: {r.collected_amount}/{r.required_amount}\n")

    f.write("\n--- AUDIT: Proof Stories ---\n")
    stories = db.query(ProofStory).all()
    for s in stories:
        f.write(f"Story ID: {s.id}, Req ID: {s.request_id}, Title: {s.title}, Media: {s.media_url}\n")

    f.write("\n--- AUDIT: Successful Transactions ---\n")
    txns = db.query(PaymentTransaction).filter(PaymentTransaction.status == "SUCCESS").all()
    for t in txns:
        f.write(f"Txn ID: {t.transaction_id}, Req ID: {t.request_id}, Trace: {t.trace_token}\n")

db.close()
