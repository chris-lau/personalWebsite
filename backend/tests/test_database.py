from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from core.db import Base
from core.models import Project, Technology


def test_database_models_and_relations():
    # Set up in-memory database for testing models
    engine = create_engine("sqlite:///:memory:")
    SessionClass = sessionmaker(bind=engine)
    Base.metadata.create_all(engine)
    db = SessionClass()

    try:
        # Create models and relations
        tech1 = Technology(name="Python")
        tech2 = Technology(name="FastAPI")
        db.add_all([tech1, tech2])
        db.commit()

        project = Project(
            id="test-project",
            title="Test Project",
            description="Testing description",
            featured=True
        )
        project.technologies = [tech1, tech2]
        db.add(project)
        db.commit()

        # Query and assert relations
        queried_project = db.query(Project).filter_by(id="test-project").first()
        assert queried_project is not None
        assert len(queried_project.technologies) == 2
        assert queried_project.technologies[0].name in ["Python", "FastAPI"]

    finally:
        db.close()
        Base.metadata.drop_all(engine)
