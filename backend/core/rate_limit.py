from slowapi import Limiter
from slowapi.util import get_remote_address
from config import settings

# Initialize slowapi limiter using remote client IP address
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"]
)
