from django.db import models
from django.conf import settings


class FacultyProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="facultyprofile"
    )

    profile_photo = models.ImageField(
        upload_to="faculty/profile/",
        blank=True,
        null=True
    )

    full_name = models.CharField(
        max_length=150,
        blank=True
    )

    employee_id = models.CharField(
        max_length=100,
        blank=True
    )

    department = models.CharField(
        max_length=150,
        blank=True
    )

    designation = models.CharField(
        max_length=150,
        blank=True
    )

    phone = models.CharField(
        max_length=20,
        blank=True
    )

    bio = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.full_name or self.user.username