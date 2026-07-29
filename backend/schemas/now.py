from pydantic import BaseModel


class NowResponse(BaseModel):
    lastUpdated: str
    currentFocus: str
    workingOn: list[str]
    reading: list[str]
    learning: list[str]
