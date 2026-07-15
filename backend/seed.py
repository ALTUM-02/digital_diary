"""
Seed script — creates demo users, entries, and activity logs.
Run: python manage.py shell < seed.py
"""

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "diaryverse.settings")
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile, DiaryEntry, MediaItem, ActivityLog

# --- Create demo users ---
users_data = [
    {"username": "sarah", "email": "sarah@diaryverse.app", "password": "user123", "name": "Sarah Chen", "role": "user", "avatar": "https://i.pravatar.cc/150?img=1"},
    {"username": "marcus", "email": "marcus@diaryverse.app", "password": "user123", "name": "Marcus Johnson", "role": "user", "avatar": "https://i.pravatar.cc/150?img=12"},
    {"username": "aisha", "email": "aisha@diaryverse.app", "password": "user123", "name": "Aisha Patel", "role": "user", "avatar": "https://i.pravatar.cc/150?img=5"},
    {"username": "diego", "email": "diego@diaryverse.app", "password": "user123", "name": "Diego Ramirez", "role": "user", "avatar": "https://i.pravatar.cc/150?img=15"},
    {"username": "yuki", "email": "yuki@diaryverse.app", "password": "user123", "name": "Yuki Tanaka", "role": "user", "avatar": "https://i.pravatar.cc/150?img=8"},
    {"username": "admin", "email": "admin@diaryverse.app", "password": "admin123", "name": "Admin Root", "role": "admin", "avatar": "https://i.pravatar.cc/150?img=68"},
]

created_users = []
for data in users_data:
    user, created = User.objects.get_or_create(
        email=data["email"],
        defaults={
            "username": data["username"],
            "first_name": data["name"],
        }
    )
    if created:
        user.set_password(data["password"])
        user.is_superuser = data["role"] == "admin"
        user.is_staff = data["role"] == "admin"
        user.save()
        UserProfile.objects.create(
            user=user,
            avatar=data["avatar"],
            role=data["role"],
        )
        print(f"Created user: {data['email']}")
    created_users.append(user)

# --- Create demo entries ---
SAMPLE_IMAGES = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800",
]

entries_data = [
    {"title": "Morning Coffee Rituals", "content": "Today started with the most perfect cup of coffee. The aroma filled the kitchen and for a moment, everything felt right in the world.", "mood": "happy", "tags": ["food", "morning"]},
    {"title": "A Walk in the Park", "content": "I took a long walk through the old oak park today. The leaves were turning golden and the air had that crisp autumn bite.", "mood": "calm", "tags": ["nature", "reflection"]},
    {"title": "Sunset Over the Mountains", "content": "The mountains never fail to take my breath away. We hiked for three hours to reach the summit, and the sunset from up there was something I'll carry with me forever.", "mood": "grateful", "tags": ["travel", "nature"]},
    {"title": "First Day at the New Job", "content": "New beginnings are always a mix of excitement and nerves. Today was my first day and everyone was so welcoming.", "mood": "excited", "tags": ["work"]},
    {"title": "Baking with Grandma's Recipe", "content": "I found Grandma's handwritten recipe card tucked inside an old cookbook. The flour dust, the careful measurements in her looping handwriting.", "mood": "thoughtful", "tags": ["family", "food"]},
    {"title": "The Concert That Changed Me", "content": "The music moved through me like a current. I've never felt so seen by a performance. The way the violin soared in the final movement left me in tears.", "mood": "excited", "tags": ["music"]},
    {"title": "Quiet Moments by the Sea", "content": "There's something about the sea that puts everything in perspective. The rhythmic waves, the salt air, the vast horizon.", "mood": "calm", "tags": ["nature", "reflection"]},
    {"title": "Finding Peace in Chaos", "content": "Life has been overwhelming lately, but today I found a quiet corner in the library and just existed for a while.", "mood": "neutral", "tags": ["reading"]},
    {"title": "A Letter to Future Self", "content": "Dear future me: I hope you're braver than I am now. I hope you took the risks I was too scared to take.", "mood": "thoughtful", "tags": ["reflection"]},
    {"title": "Weekend Trip to the Coast", "content": "We drove two hours to reach the coast and it was worth every minute. The cliffs were dramatic, the water impossibly blue.", "mood": "happy", "tags": ["travel", "adventure"]},
    {"title": "The Book That Moved Me", "content": "I finished the book at 2 AM and couldn't sleep afterwards. Some stories leave a mark on your soul.", "mood": "thoughtful", "tags": ["reading"]},
    {"title": "Rainy Day Reflections", "content": "The rain came down in sheets today and I loved every minute of it. I made tea, wrapped myself in a blanket, and wrote three pages without stopping.", "mood": "calm", "tags": ["reflection"]},
    {"title": "Garden in Full Bloom", "content": "The garden has exploded with color. The roses I planted last spring are finally blooming, and the bees have returned.", "mood": "grateful", "tags": ["nature"]},
    {"title": "City Lights at Midnight", "content": "I walked through downtown at midnight and the city felt like it belonged to me. The neon reflections on wet pavement.", "mood": "neutral", "tags": ["adventure"]},
    {"title": "Reconnecting with Old Friends", "content": "We hadn't spoken in five years, but tonight felt like no time had passed. We laughed about old mistakes and dreamed about new adventures.", "mood": "happy", "tags": ["friends"]},
]

TYPING_STYLES = ["modern-clean", "elegant-serif", "handwriting-casual", "script-flow", "pacifico-wave", "lora-classic", "mono-tech", "fraunces-bold"]
MOTION_EFFECTS = ["kenburns", "slide", "fade", "zoom"]

import random
random.seed(42)

for i, entry_data in enumerate(entries_data):
    author = created_users[i % 5]
    entry, created = DiaryEntry.objects.get_or_create(
        title=entry_data["title"],
        author=author,
        defaults={
            "content": entry_data["content"],
            "mood": entry_data["mood"],
            "tags": entry_data["tags"],
            "typing_style_id": random.choice(TYPING_STYLES),
            "is_private": random.random() > 0.7,
        }
    )
    if created:
        # Add random media
        media_count = random.randint(0, 3)
        for j in range(media_count):
            MediaItem.objects.create(
                entry=entry,
                media_type="image",
                url=SAMPLE_IMAGES[(i + j) % len(SAMPLE_IMAGES)],
                caption="A moment worth remembering" if random.random() > 0.5 else None,
                motion_effect=random.choice(MOTION_EFFECTS),
            )
        ActivityLog.objects.create(user=author, action="Created Entry", details=entry.title)

# --- Activity logs ---
ActivityLog.objects.create(user=created_users[0], action="Uploaded Media", details="3 images")
ActivityLog.objects.create(user=created_users[2], action="Updated Profile", details="Changed avatar")
ActivityLog.objects.create(user=created_users[4], action="Logged In", details="Web browser")

print(f"\nSeed complete!")
print(f"  Users: {User.objects.count()}")
print(f"  Entries: {DiaryEntry.objects.count()}")
print(f"  Media: {MediaItem.objects.count()}")
print(f"  Activity Logs: {ActivityLog.objects.count()}")
print(f"\nDemo credentials:")
print(f"  User:  sarah@diaryverse.app / user123")
print(f"  Admin: admin@diaryverse.app / admin123")
