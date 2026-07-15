"""
Diary models — User profile, DiaryEntry, MediaItem.
Uses Django's built-in auth User with a profile extension.
"""

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extends Django auth User with diary-specific fields."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.URLField(max_length=500, default="https://i.pravatar.cc/150?u=default")
    role = models.CharField(max_length=10, default="user")  # "user" or "admin"

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class DiaryEntry(models.Model):
    """A diary entry with text, mood, tags, and linked media."""

    MOOD_CHOICES = [
        ("happy", "Happy"),
        ("excited", "Excited"),
        ("calm", "Calm"),
        ("neutral", "Neutral"),
        ("thoughtful", "Thoughtful"),
        ("sad", "Sad"),
        ("angry", "Angry"),
        ("grateful", "Grateful"),
    ]

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="entries")
    title = models.CharField(max_length=255)
    content = models.TextField()
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES, default="neutral")
    tags = models.JSONField(default=list, blank=True)
    typing_style_id = models.CharField(max_length=50, default="modern-clean")
    is_private = models.BooleanField(default=False)
    word_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} by {self.author.username}"

    def save(self, *args, **kwargs):
        self.word_count = len(self.content.split())
        super().save(*args, **kwargs)


class MediaItem(models.Model):
    """Media attached to a diary entry (image or video)."""

    MEDIA_TYPES = [("image", "Image"), ("video", "Video")]
    MOTION_EFFECTS = [
        ("kenburns", "Ken Burns"),
        ("slide", "Slide"),
        ("fade", "Fade"),
        ("zoom", "Zoom"),
        ("none", "None"),
    ]

    entry = models.ForeignKey(DiaryEntry, on_delete=models.CASCADE, related_name="media_items")
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default="image")
    url = models.URLField(max_length=1000)
    thumbnail_url = models.URLField(max_length=1000, blank=True, null=True)
    caption = models.CharField(max_length=500, blank=True, null=True)
    motion_effect = models.CharField(max_length=20, choices=MOTION_EFFECTS, default="kenburns")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.media_type} for {self.entry.title}"


class ActivityLog(models.Model):
    """Tracks user actions for admin dashboard."""

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=100)
    details = models.CharField(max_length=500, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} - {self.action}"
