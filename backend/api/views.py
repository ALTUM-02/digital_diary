"""
Custom GraphQLView that injects the authenticated user into the context
by decoding the JWT token from the Authorization header.
"""

from graphene_django.views import GraphQLView
from api.middleware import get_user_from_request


class JWTGraphQLView(GraphQLView):
    """GraphQL view that resolves the user from JWT token."""

    def get_context(self, request):
        context = super().get_context(request)
        user = get_user_from_request(request)
        if user:
            context.user = user
        else:
            # AnonymousUser fallback
            from django.contrib.auth.models import AnonymousUser
            context.user = AnonymousUser()
        return context
