def test_get_profile(client):
    response = client.get("/api/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Chris Lau"
    assert "socials" in data
    assert len(data["socials"]) > 0


def test_list_projects(client):
    response = client.get("/api/projects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["id"] == "multi-agent-system"


def test_get_project_by_slug_valid(client):
    response = client.get("/api/projects/personal-os")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "personal-os"
    assert "React" in data["techStack"]


def test_get_project_by_slug_invalid(client):
    response = client.get("/api/projects/non-existent-project")
    assert response.status_code == 404
    assert response.json()["detail"] == "Project with ID 'non-existent-project' not found"


def test_list_skills(client):
    response = client.get("/api/skills")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["category"] == "Product & Leadership"


def test_list_experience(client):
    response = client.get("/api/experience")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["company"] == "Global Relay"


def test_get_now(client):
    response = client.get("/api/now")
    assert response.status_code == 200
    data = response.json()
    assert "lastUpdated" in data
    assert "currentFocus" in data
    assert isinstance(data["workingOn"], list)


def test_list_posts(client):
    response = client.get("/api/posts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 20


def test_get_post_by_slug_valid(client):
    response = client.get("/api/posts/demystifying-react-architecture-and-dev-tools")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "demystifying-react-architecture-and-dev-tools"
    assert len(data["content"]) > 0


def test_get_post_by_slug_invalid(client):
    response = client.get("/api/posts/non-existent-slug")
    assert response.status_code == 404
    assert response.json()["detail"] == "Blog post with slug 'non-existent-slug' not found"


def test_list_guidebook_chapters(client):
    response = client.get("/api/guidebook")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 9
    assert data[0]["id"] == "chapter-1"


def test_get_guidebook_chapter_valid(client):
    response = client.get("/api/guidebook/chapter-1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "chapter-1"
    assert data["number"] == 1
    assert len(data["content"]) > 0


def test_get_guidebook_chapter_invalid(client):
    response = client.get("/api/guidebook/chapter-999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Guidebook chapter 'chapter-999' not found"
