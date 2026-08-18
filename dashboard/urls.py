from django.urls import path
from . import views

urlpatterns = [
    # Unified Dashboard
    path('', views.dashboard, name='dashboard'),
    
    # Public Portfolio Page
    path('portfolio/<str:username>/', views.public_portfolio, name='public_portfolio'),
    
    # Notification Actions
    path('api/notifications/read-all/', views.notifications_read_all, name='api_notifications_read_all'),
    
    # Student Profile & Portfolio Actions
    path('api/student/profile/update/', views.student_update_profile, name='api_student_update_profile'),
    path('api/student/skills/add/', views.student_add_skill, name='api_student_add_skill'),
    path('api/student/skills/delete/', views.student_delete_skill, name='api_student_delete_skill'),
    path('api/student/projects/add/', views.student_add_project, name='api_student_add_project'),
    path('api/student/projects/delete/', views.student_delete_project, name='api_student_delete_project'),
    path('api/student/certificates/add/', views.student_add_certificate, name='api_student_add_certificate'),
    path('api/student/certificates/delete/', views.student_delete_certificate, name='api_student_delete_certificate'),
    path('api/student/internships/add/', views.student_add_internship, name='api_student_add_internship'),
    path('api/student/internships/delete/', views.student_delete_internship, name='api_student_delete_internship'),
    path('api/student/achievements/add/', views.student_add_achievement, name='api_student_add_achievement'),
    path('api/student/achievements/delete/', views.student_delete_achievement, name='api_student_delete_achievement'),
    path('api/student/research/add/', views.student_add_research, name='api_student_add_research'),
    path('api/student/research/delete/', views.student_delete_research, name='api_student_delete_research'),
    path('api/student/opportunities/apply/', views.student_apply_opportunity, name='api_student_apply_opportunity'),
    
    # Faculty Verification Actions
    path('api/faculty/student-detail/<int:student_id>/', views.faculty_student_detail, name='api_faculty_student_detail'),
    path('api/faculty/verify/', views.faculty_verify_item, name='api_faculty_verify'),
    path('api/faculty/feedback/add/', views.faculty_add_feedback, name='api_faculty_add_feedback'),
    
    # Admin Control Panel Actions
    path('api/admin/faculty/add/', views.admin_add_faculty, name='api_admin_add_faculty'),
    path('api/admin/user/delete/', views.admin_delete_user, name='api_admin_delete_user'),
    path('api/admin/opportunities/add/', views.admin_add_opportunity, name='api_admin_add_opportunity'),
    path('api/admin/opportunities/delete/', views.admin_delete_opportunity, name='api_admin_delete_opportunity'),
]