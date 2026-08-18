from django.contrib import admin
from .models import StudentProfile, Skill, StudentSkill, Project


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "full_name",
        "college",
        "department",
        "graduation_year",
    )

    search_fields = (
        "user__username",
        "user__email",
        "full_name",
        "college",
        "department",
    )

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "category",
        "created_at",
    )

    list_filter = (
        "category",
    )

    search_fields = (
        "name",
    )

@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):

    list_display = (
        "student",
        "skill",
        "level",
        "years_experience",
        "verification_status",
        "verified_by",
        "created_at",
    )

    list_filter = (
        "verification_status",
        "level",
        "skill__category",
    )

    search_fields = (
        "student__user__username",
        "student__user__email",
        "student__full_name",
        "skill__name",
    )

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "student",
        "project_type",
        "created_at",
    )

    list_filter = (
        "project_type",
        "created_at",
    )

    search_fields = (
        "name",
        "technologies",
        "student__user__username",
    )