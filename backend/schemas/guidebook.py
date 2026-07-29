from pydantic import BaseModel


class GuidebookChapterResponse(BaseModel):
    id: str
    number: int
    title: str
    subsections: list[str]
    content: str
