"""
Root GraphQL schema for DiaryVerse.
Combines query and mutation types from the api app.
"""

import graph
from api.schema import Query, Mutation

schema = graphene.Schema(query=Query, mutation=Mutation)
