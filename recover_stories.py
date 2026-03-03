from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.getcwd())

from models.victim_request import VictimRequest, RequestStatus
from models.proof_story import ProofStory

DATABASE_URL = "postgresql://tracedonate:tracedonate_secure_pass@localhost:5432/tracedonate"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def recover_stories():
    print("\n--- RECOVERY: Migrating Completion Stories to ProofStories ---")
    requests = db.query(VictimRequest).filter(VictimRequest.status == RequestStatus.COMPLETED).all()
    
    recovered_count = 0
    for r in requests:
        # Check if a ProofStory already exists
        exists = db.query(ProofStory).filter(ProofStory.request_id == r.id).first()
        if not exists:
            print(f"🔄 Recovering story for Req ID: {r.id} ({r.title})")
            new_proof = ProofStory(
                request_id=r.id,
                uploaded_by=r.victim_id,
                title=f"Impact: {r.title}",
                description=r.completion_story or "No description provided during initial submission.",
                media_url=r.completion_proof_url,
                is_verified=True
            )
            db.add(new_proof)
            recovered_count += 1
        else:
            print(f"✅ Story already exists for Req ID: {r.id}")

    db.commit()
    print(f"\n✨ Successfully recovered {recovered_count} impact stories!")

if __name__ == "__main__":
    recover_stories()
    db.close()
