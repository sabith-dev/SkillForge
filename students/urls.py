from django.urls import path
from . import views

from .views import student_dashboard, student_skills

app_name = "students"

urlpatterns = [
    path(
        "dashboard/",
        views.student_dashboard,
        name="dashboard"
    ),

    path(
        "skills/",
        views.student_skills,
        name="student_skills"
    ),

    path(
        "projects/",
        views.project_list,
        name="project_list"
    ),

    path(
        "projects/add/",
        views.project_create,
        name="project_create"
    ),
]