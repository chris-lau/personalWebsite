from pydantic import BaseModel


class ExperienceItemResponse(BaseModel):
    id: str
    role: str
    company: str
    location: str
    startDate: str
    endDate: str
    description: str
    highlights: list[str]
