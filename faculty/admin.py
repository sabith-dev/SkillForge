from django.contrib import admin
from .models import FacultyProfile

@admin.register(FacultyProfile)
class FacultyProfileAdmin(admin.ModelAdmin):
    list_display =(
        'full_name',
        'department',
        'designation',
    )