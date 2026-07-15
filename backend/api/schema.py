"""
GraphQL schema for DiaryVerse.
Defines Query (read) and Mutation (write) types.
"""

import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from django.db.models import Count

from .models import UserProfile, DiaryEntry, MediaItem, ActivityLog
from .middleware import create_token, get_user_from_request


# --- Types ---

class UserProfileType(DjangoObjectType):
    class Meta:
        model = UserProfile
        fields = ("id", "avatar", "role")


class UserType(DjangoObjectType):
    profile = graphene.Field(UserProfileType)
    entries_count = graphene.Int()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "date_joined")

    def resolve_entries_count(self, info):
        return self.entries.count()

    def resolve_profile(self, info):
        profile, _ = UserProfile.objects.get_or_create(user=self, defaults={"avatar": f"https://i.pravatar.cc/150?u={self.username}", "role": "user"})
        return profile


class MediaItemType(DjangoObjectType):
    class Meta:
        model = MediaItem
        fields = ("id", "media_type", "url", "thumbnail_url", "caption", "motion_effect", "created_at")


class DiaryEntryType(DjangoObjectType):
    author_name = graphene.String()
    author_avatar = graphene.String()
    media = graphene.List(MediaItemType)

    class Meta:
        model = DiaryEntry
        fields = ("id", "title", "content", "mood", "tags", "typing_style_id",
                   "is_private", "word_count", "created_at", "updated_at")

    def resolve_author_name(self, info):
        return self.author.get_full_name() or self.author.username

    def resolve_author_avatar(self, info):
        profile = getattr(self.author, "profile", None)
        return profile.avatar if profile else ""

    def resolve_media(self, info):
        return self.media_items.all()


class ActivityLogType(DjangoObjectType):
    user_name = graphene.String()

    class Meta:
        model = ActivityLog
        fields = ("id", "action", "details", "timestamp")

    def resolve_user_name(self, info):
        return self.user.get_full_name() or self.user.username if self.user else "Unknown"


# --- Input Types ---

class MediaItemInput(graphene.InputObjectType):
    media_type = graphene.String(required=True)
    url = graphene.String(required=True)
    thumbnail_url = graphene.String()
    caption = graphene.String()
    motion_effect = graphene.String(default_value="kenburns")


class CreateEntryInput(graphene.InputObjectType):
    title = graphene.String(required=True)
    content = graphene.String(required=True)
    mood = graphene.String(default_value="neutral")
    tags = graphene.List(graphene.String, default_value=[])
    typing_style_id = graphene.String(default_value="modern-clean")
    is_private = graphene.Boolean(default_value=False)
    media = graphene.List(MediaItemInput, default_value=[])


class UpdateEntryInput(graphene.InputObjectType):
    title = graphene.String()
    content = graphene.String()
    mood = graphene.String()
    tags = graphene.List(graphene.String)
    typing_style_id = graphene.String()
    is_private = graphene.Boolean()
    media = graphene.List(MediaItemInput)


# --- Auth Result ---

class AuthResult(graphene.ObjectType):
    token = graphene.String()
    user = graphene.Field(UserType)
    success = graphene.Boolean()
    error = graphene.String()


# --- Query ---

class Query(graphene.ObjectType):
    # Auth
    me = graphene.Field(UserType)

    # Entries
    all_entries = graphene.List(DiaryEntryType, description="All entries (admin only)")
    my_entries = graphene.List(DiaryEntryType, description="Current user's entries")
    entry = graphene.Field(DiaryEntryType, id=graphene.ID(required=True))

    # Users
    all_users = graphene.List(UserType, description="All users (admin only)")

    # Activity logs
    activity_logs = graphene.List(ActivityLogType, description="Recent activity (admin only)")

    # Stats
    entry_stats = graphene.JSONField(description="Aggregated stats for admin dashboard")

    def resolve_me(self, info):
        user = getattr(info.context, "user", None)
        if not user or not user.is_authenticated:
            return None
        return user

    def resolve_all_entries(self, info):
        user = getattr(info.context, "user", None)
        if not user or not user.is_authenticated:
            return DiaryEntry.objects.none()
        if hasattr(user, "profile") and user.profile.role == "admin":
            return DiaryEntry.objects.all()
        return DiaryEntry.objects.filter(author=user)

    def resolve_my_entries(self, info):
        user = getattr(info.context, "user", None)
        if not user or not user.is_authenticated:
            return DiaryEntry.objects.none()
        return DiaryEntry.objects.filter(author=user)

    def resolve_entry(self, info, id):
        user = getattr(info.context, "user", None)
        if not user or not user.is_authenticated:
            return None
        entry = DiaryEntry.objects.filter(id=id).first()
        if not entry:
            return None
        # Users can see their own entries; admins can see all
        if entry.author == user or (hasattr(user, "profile") and user.profile.role == "admin"):
            return entry
        if not entry.is_private:
            return entry
        return None

    def resolve_all_users(self, info):
        user = getattr(info.context, "user", None)
        if not user or not user.is_authenticated:
            return User.objects.none()
        if hasattr(user, "profile") and user.profile.role == "admin":
            return User.objects.filter(is_superuser=False)
        return User.objects.none()

    def resolve_activity_logs(self, info):
        user = getattr(info.context, "user", None)
        if not user or not user.is_authenticated:
            return ActivityLog.objects.none()
        if hasattr(user, "profile") and user.profile.role == "admin":
            return ActivityLog.objects.all()[:50]
        return ActivityLog.objects.filter(user=user)[:20]

    def resolve_entry_stats(self, info):
        user = getattr(info.context, "user", None)
        if not user or not user.is_authenticated:
            return {}
        is_admin = hasattr(user, "profile") and user.profile.role == "admin"

        if is_admin:
            entries = DiaryEntry.objects.all()
        else:
            entries = DiaryEntry.objects.filter(author=user)

        total_entries = entries.count()
        total_images = MediaItem.objects.filter(entry__in=entries, media_type="image").count()
        total_videos = MediaItem.objects.filter(entry__in=entries, media_type="video").count()
        total_words = sum(e.word_count for e in entries)

        # Mood distribution
        mood_dist = {}
        for entry in entries:
            mood_dist[entry.mood] = mood_dist.get(entry.mood, 0) + 1

        # Entries by day (last 7 days)
        from django.utils import timezone
        from datetime import timedelta
        days_data = []
        for i in range(6, -1, -1):
            day = timezone.now().date() - timedelta(days=i)
            count = entries.filter(created_at__date=day).count()
            import calendar
            days_data.append({
                "name": calendar.day_name[day.weekday()][:3],
                "value": count,
            })

        return {
            "totalEntries": total_entries,
            "totalImages": total_images,
            "totalVideos": total_videos,
            "totalWords": total_words,
            "moodDistribution": [{"name": k.capitalize(), "value": v} for k, v in mood_dist.items()],
            "entriesByDay": days_data,
            "totalUsers": User.objects.filter(is_superuser=False).count() if is_admin else 1,
        }


# --- Mutations ---

class Register(graphene.Mutation):
    """Register a new user."""

    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        name = graphene.String()

    Output = AuthResult

    def mutate(self, info, username, email, password, name=None):
        if User.objects.filter(email=email).exists():
            return AuthResult(success=False, error="Email already registered")
        if User.objects.filter(username=username).exists():
            return AuthResult(success=False, error="Username already taken")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name or username,
        )
        UserProfile.objects.create(
            user=user,
            avatar=f"https://i.pravatar.cc/150?u={username}",
            role="user",
        )
        ActivityLog.objects.create(user=user, action="Registered", details=f"New account: {email}")
        token = create_token(user.id, user.username, "user")
        return AuthResult(token=token, user=user, success=True)


class Login(graphene.Mutation):
    """Login with email and password."""

    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    Output = AuthResult

    def mutate(self, info, email, password):
        user = User.objects.filter(email=email).first()
        if not user:
            return AuthResult(success=False, error="User not found")
        if not user.check_password(password):
            return AuthResult(success=False, error="Invalid password")

        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"avatar": f"https://i.pravatar.cc/150?u={user.username}", "role": "admin" if user.is_superuser else "user"})
        role = profile.role

        ActivityLog.objects.create(user=user, action="Logged In", details="Web browser")
        token = create_token(user.id, user.username, role)
        return AuthResult(token=token, user=user, success=True)


class CreateEntry(graphene.Mutation):
    """Create a new diary entry."""

    class Arguments:
        input = CreateEntryInput(required=True)

    Output = DiaryEntryType

    def mutate(self, info, input):
        user = getattr(info.context, "user", None)
        if not user or not user.is_authenticated:
            raise Exception("Authentication required")

        entry = DiaryEntry.objects.create(
            author=user,
            title=input.title,
            content=input.content,
            mood=input.mood,
            tags=input.tags or [],
            typing_style_id=input.typing_style_id,
            is_private=input.is_private,
        )

        for media_input in (input.media or []):
            MediaItem.objects.create(
                entry=entry,
                media_type=media_input.media_type,
                url=media_input.url,
                thumbnail_url=media_input.thumbnail_url,
                caption=media_input.caption,
                motion_effect=media_input.motion_effect,
            )

        ActivityLog.objects.create(user=user, action="Created Entry", details=entry.title)
        return entry


class UpdateEntry(graphene.Mutation):
    """Update an existing diary entry."""

    class Arguments:
        id = graphene.ID(required=True)
        input = UpdateEntryInput(required=True)

    Output = DiaryEntryType

    def mutate(self, info, id, input):
        user = getattr(info.context, "user", None)
        if not user or not user.is_authenticated:
            raise Exception("Authentication required")

        entry = DiaryEntry.objects.filter(id=id).first()
        if not entry:
            raise Exception("Entry not found")
        if entry.author != user:
            raise Exception("You can only edit your own entries")

        if input.title is not None:
            entry.title = input.title
        if input.content is not None:
            entry.content = input.content
        if input.mood is not None:
            entry.mood = input.mood
        if input.tags is not None:
            entry.tags = input.tags
        if input.typing_style_id is not None:
            entry.typing_style_id = input.typing_style_id
        if input.is_private is not None:
            entry.is_private = input.is_private
        entry.save()

        if input.media is not None:
            entry.media_items.all().delete()
            for media_input in input.media:
                MediaItem.objects.create(
                    entry=entry,
                    media_type=media_input.media_type,
                    url=media_input.url,
                    thumbnail_url=media_input.thumbnail_url,
                    caption=media_input.caption,
                    motion_effect=media_input.motion_effect,
                )

        ActivityLog.objects.create(user=user, action="Updated Entry", details=entry.title)
        return entry


class DeleteEntry(graphene.Mutation):
    """Delete a diary entry."""

    class Arguments:
        id = graphene.ID(required=True)

    Output = graphene.Boolean

    def mutate(self, info, id):
        user = getattr(info.context, "user", None)
        if not user or not user.is_authenticated:
            raise Exception("Authentication required")

        entry = DiaryEntry.objects.filter(id=id, author=user).first()
        if not entry:
            raise Exception("Entry not found or not owned by you")

        entry.delete()
        ActivityLog.objects.create(user=user, action="Deleted Entry", details=id)
        return True


class Mutation(graphene.ObjectType):
    register = Register.Field()
    login = Login.Field()
    create_entry = CreateEntry.Field()
    update_entry = UpdateEntry.Field()
    delete_entry = DeleteEntry.Field()
