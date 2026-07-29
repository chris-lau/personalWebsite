from pydantic import BaseModel


class SkillCategoryResponse(BaseModel):
    category: str
    skills: list[str]
