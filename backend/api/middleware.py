"""
JWT middleware for GraphQL — extracts token from Authorization header
and attaches the user to the GraphQL context.
"""

import jwt
import datetime
from django.contrib.auth.models import User
from django.conf import settings


def create_token(user_id: int, username: str, role: str) -> str:
    """Create a JWT token for a user."""
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "exp": datetime.datetime.utcnow() + settings.JWT_EXPIRATION,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict | None:
    """Decode and verify a JWT token. Returns payload or None."""
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


class JWTMiddleware:
    """Graphene middleware that resolves the user from JWT."""

    def resolve(self, next_, root, info, **args):
        return next_(root, info, **args)


def get_user_from_request(request):
    """Extract user from Authorization header."""
    if not hasattr(request, "META"):
        return None

    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header[7:]
    payload = decode_token(token)
    if not payload:
        return None

    try:
        return User.objects.get(id=payload["user_id"])
    except User.DoesNotExist:
        return None
