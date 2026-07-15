"""Admin configuration for the api app."""
from django.contrib import admin
from .models import UserProfile, DiaryEntry, MediaItem, ActivityLog

admin.site.register(UserProfile)
admin.site.register(DiaryEntry)
admin.site.register(MediaItem)
admin.site.register(ActivityLog)
