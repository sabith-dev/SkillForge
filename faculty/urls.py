from django.urls import path

from .views import faculty_dashboard
from . import views

app_name = "faculty"

urlpatterns = [

    path(
        "dashboard/",
        views.faculty_dashboard,
        name="dashboard"
    ),

    path(
        "verify-skill/<int:skill_id>/<str:action>/",
        views.verify_skill,
        name="verify_skill"
    ),

]