import json
import os

from sqlalchemy.orm import Session

from core.db import SessionLocal
from core.models import NowEntry, Project, ReadingItem, Technology


def seed_database():
    print("Starting database seeding...")
    db: Session = SessionLocal()

    # Define base path to read JSON files
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")

    try:
        # 1. Seed Projects & Technologies
        projects_file = os.path.join(data_dir, "projects.json")
        if os.path.exists(projects_file):
            print("Seeding projects and technologies...")
            with open(projects_file, "r") as f:
                projects_data = json.load(f)

            # Remove projects no longer present in projects.json (stale data on re-seeding)
            json_ids = {proj["id"] for proj in projects_data}
            stale_projects = db.query(Project).filter(~Project.id.in_(json_ids)).all()
            for stale in stale_projects:
                print(f"Removing stale project: {stale.id}")
                db.delete(stale)
            db.flush()

            for proj in projects_data:
                # Find or create project
                project = db.query(Project).filter_by(id=proj["id"]).first()
                if not project:
                    project = Project(
                        id=proj["id"],
                        title=proj["title"],
                        description=proj["description"],
                        github_url=proj.get("githubUrl"),
                        live_url=proj.get("liveUrl"),
                        featured=proj.get("featured", False)
                    )
                    db.add(project)
                else:
                    project.title = proj["title"]
                    project.description = proj["description"]
                    project.github_url = proj.get("githubUrl")
                    project.live_url = proj.get("liveUrl")
                    project.featured = proj.get("featured", False)

                # Find or create technologies and associate them
                tech_list = []
                for tech_name in proj.get("techStack", []):
                    tech = db.query(Technology).filter_by(name=tech_name).first()
                    if not tech:
                        tech = Technology(name=tech_name)
                        db.add(tech)
                        db.flush()  # Populate tech.id
                    tech_list.append(tech)

                project.technologies = tech_list

            db.commit()
            print("Successfully seeded projects & technologies.")
        else:
            print(f"Warning: projects.json not found at {projects_file}")

        # 2. Seed Now Page Data
        now_file = os.path.join(data_dir, "now.json")
        if os.path.exists(now_file):
            print("Seeding Now page entries...")
            with open(now_file, "r") as f:
                now_data = json.load(f)

            # Clear existing NowEntry items to avoid duplicates/stale data on re-seeding
            db.query(NowEntry).delete()

            # Seed lastUpdated
            if "lastUpdated" in now_data:
                db.add(NowEntry(category="lastUpdated", content=now_data["lastUpdated"]))

            # Seed currentFocus
            if "currentFocus" in now_data:
                db.add(NowEntry(category="currentFocus", content=now_data["currentFocus"]))

            # Seed list categories
            for cat in ["workingOn", "reading", "learning"]:
                if cat in now_data:
                    for item in now_data[cat]:
                        db.add(NowEntry(category=cat, content=item))

            db.commit()
            print("Successfully seeded Now entries.")
        else:
            print(f"Warning: now.json not found at {now_file}")

        # 3. Seed Reading items if available (optional/default values)
        # Check if there are reading items to add or add standard placeholder items
        print("Seeding default reading items...")
        db.query(ReadingItem).delete()
        default_books = [
            ReadingItem(title="Designing Data-Intensive Applications", author="Martin Kleppmann", status="completed", rating=5, notes="Excellent book on distributed systems architectures."),
            ReadingItem(title="Staff Engineer", author="Will Larson", status="reading", notes="Insightful guide to technical leadership tracks."),
            ReadingItem(title="Understanding Distributed Systems", author="Roberto Vitillo", status="queued", notes="Next on my reading queue.")
        ]
        db.add_all(default_books)
        db.commit()
        print("Successfully seeded reading items.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()
        print("Database seeding completed.")


if __name__ == "__main__":
    seed_database()
