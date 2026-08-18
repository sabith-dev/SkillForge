import json
import datetime
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db import transaction, IntegrityError
from django.utils import timezone

from accounts.models import User
from students.models import (
    StudentProfile, Skill, StudentSkill, Project, Certificate,
    Internship, Achievement, Seminar, ResearchPaper, Opportunity,
    OpportunityApplication, FacultyFeedback, Notification
)
from faculty.models import FacultyProfile

from .serializers import (
    serialize_user, serialize_student_profile, serialize_student_skill,
    serialize_project, serialize_certificate, serialize_internship,
    serialize_achievement, serialize_seminar, serialize_research_paper,
    serialize_opportunity, serialize_feedback, serialize_notification,
    serialize_faculty_profile
)

def populate_default_skills():
    default_skills = [
        ("Python", "programming", "Python programming language"),
        ("JavaScript", "programming", "JavaScript programming language"),
        ("Java", "programming", "Java programming language"),
        ("C++", "programming", "C++ programming language"),
        ("Go", "programming", "Go programming language"),
        
        ("React", "frontend", "React JavaScript UI Library"),
        ("HTML", "frontend", "HyperText Markup Language"),
        ("CSS", "frontend", "Cascading Style Sheets"),
        ("TailwindCSS", "frontend", "Utility-first CSS framework"),
        ("TypeScript", "frontend", "Typed JavaScript superset"),
        ("Next.js", "frontend", "React metaframework"),
        
        ("Django", "backend", "Django Python Web Framework"),
        ("Node.js", "backend", "Node.js JavaScript Runtime"),
        ("Express", "backend", "Express Web Framework"),
        ("FastAPI", "backend", "FastAPI Python Web Framework"),
        
        ("PostgreSQL", "database", "PostgreSQL Relational Database"),
        ("MySQL", "database", "MySQL Relational Database"),
        ("MongoDB", "database", "MongoDB NoSQL Database"),
        ("Redis", "database", "Redis Cache and Key-Value Store"),
        
        ("Docker", "devops", "Docker Containerization Platform"),
        ("Git", "devops", "Git Version Control System"),
        
        ("Figma", "design", "Figma Collaborative Interface Design Tool"),
        ("UI/UX Design", "design", "User Interface and User Experience design principles"),
    ]
    for name, category, desc in default_skills:
        Skill.objects.get_or_create(
            name=name,
            defaults={"category": category, "description": desc}
        )


@login_required
def dashboard(request):
    user = request.user
    
    # Auto-populate default skills if empty
    if Skill.objects.count() == 0:
        populate_default_skills()
        
    dashboard_data = {
        "user": serialize_user(user),
        "notifications": [serialize_notification(n) for n in user.notifications.all().order_by("-created_at")[:20]],
    }
    
    # STUDENT
    if user.role == User.Role.STUDENT:
        profile, created = StudentProfile.objects.get_or_create(user=user)
        
        dashboard_data["profile"] = serialize_student_profile(profile)
        dashboard_data["profile_strength"] = profile.profile_strength
        dashboard_data["career_score"] = profile.career_score
        
        dashboard_data["skills"] = [serialize_student_skill(s) for s in profile.skills.all()]
        dashboard_data["all_skills_list"] = [{"id": s.id, "name": s.name, "category": s.category} for s in Skill.objects.all()]
        dashboard_data["projects"] = [serialize_project(p) for p in profile.projects.all().order_by("-created_at")]
        dashboard_data["certificates"] = [serialize_certificate(c) for c in profile.certificates.all().order_by("-created_at")]
        dashboard_data["internships"] = [serialize_internship(i) for i in profile.internships.all().order_by("-created_at")]
        dashboard_data["achievements"] = [serialize_achievement(a) for a in profile.achievements.all().order_by("-created_at")]
        dashboard_data["seminars"] = [serialize_seminar(s) for s in profile.seminars.all().order_by("-created_at")]
        dashboard_data["research_papers"] = [serialize_research_paper(r) for r in profile.research_papers.all().order_by("-created_at")]
        dashboard_data["feedbacks"] = [serialize_feedback(f) for f in profile.feedbacks.all().order_by("-created_at")]
        
        # Load opportunities with match score
        opps = Opportunity.objects.all().order_by("-date_posted")
        dashboard_data["opportunities"] = [serialize_opportunity(o, profile) for o in opps]
        
    # FACULTY
    elif user.role == User.Role.FACULTY:
        profile, created = FacultyProfile.objects.get_or_create(user=user)
        
        dashboard_data["profile"] = serialize_faculty_profile(profile)
        
        # All students list
        students = StudentProfile.objects.all()
        serialized_students = []
        for s in students:
            serialized_students.append({
                "id": s.id,
                "username": s.user.username,
                "full_name": s.full_name or s.user.username,
                "email": s.user.email,
                "department": s.department,
                "college": s.college,
                "career_score": s.career_score,
                "profile_strength": s.profile_strength
            })
        dashboard_data["students"] = serialized_students
        
        # Pending Verifications
        pending_skills = StudentSkill.objects.filter(verification_status="pending").select_related("student", "student__user", "skill")
        pending_projects = Project.objects.filter(verification_status="pending").select_related("student", "student__user")
        pending_certs = Certificate.objects.filter(verification_status="pending").select_related("student", "student__user")
        pending_internships = Internship.objects.filter(verification_status="pending").select_related("student", "student__user")
        pending_seminars = Seminar.objects.filter(verification_status="pending").select_related("student", "student__user")
        pending_papers = ResearchPaper.objects.filter(verification_status="pending").select_related("student", "student__user")
        
        dashboard_data["pending_verifications"] = {
            "skills": [{
                "id": pk.id,
                "student_name": pk.student.full_name or pk.student.user.username,
                "student_username": pk.student.user.username,
                "name": pk.skill.name,
                "category": pk.skill.get_category_display(),
                "level": pk.get_level_display(),
                "years_experience": float(pk.years_experience),
                "created_at": pk.created_at.isoformat()
            } for pk in pending_skills],
            
            "projects": [{
                "id": p.id,
                "student_name": p.student.full_name or p.student.user.username,
                "student_username": p.student.user.username,
                "name": p.name,
                "description": p.description,
                "project_type": p.get_project_type_display(),
                "technologies": p.technologies,
                "github_url": p.github_url,
                "live_demo_url": p.live_demo_url,
                "role": p.role,
                "created_at": p.created_at.isoformat()
            } for p in pending_projects],
            
            "certificates": [{
                "id": c.id,
                "student_name": c.student.full_name or c.student.user.username,
                "student_username": c.student.user.username,
                "name": c.name,
                "issuing_organization": c.issuing_organization,
                "issue_date": c.issue_date.isoformat(),
                "credential_url": c.credential_url,
                "created_at": c.created_at.isoformat()
            } for c in pending_certs],
            
            "internships": [{
                "id": i.id,
                "student_name": i.student.full_name or i.student.user.username,
                "student_username": i.student.user.username,
                "company_name": i.company_name,
                "role": i.role,
                "start_date": i.start_date.isoformat(),
                "end_date": i.end_date.isoformat() if i.end_date else "Present",
                "description": i.description,
                "skills": i.skills,
                "created_at": i.created_at.isoformat()
            } for i in pending_internships],
            
            "seminars": [{
                "id": sem.id,
                "student_name": sem.student.full_name or sem.student.user.username,
                "student_username": sem.student.user.username,
                "topic": sem.topic,
                "institution": sem.institution,
                "date": sem.date.isoformat(),
                "created_at": sem.created_at.isoformat()
            } for sem in pending_seminars],
            
            "research_papers": [{
                "id": paper.id,
                "student_name": paper.student.full_name or paper.student.user.username,
                "student_username": paper.student.user.username,
                "title": paper.title,
                "authors": paper.authors,
                "publication": paper.publication,
                "publication_date": paper.publication_date.isoformat(),
                "paper_url": paper.paper_url,
                "created_at": paper.created_at.isoformat()
            } for paper in pending_papers]
        }
        
    # ADMIN
    elif user.role == User.Role.ADMIN or user.is_superuser:
        dashboard_data["stats"] = {
            "total_students": StudentProfile.objects.count(),
            "total_faculty": FacultyProfile.objects.count(),
            "total_projects": Project.objects.count(),
            "total_certificates": Certificate.objects.count(),
            "total_internships": Internship.objects.count(),
            "total_verified_skills": StudentSkill.objects.filter(verification_status="approved").count()
        }
        
        # Simple mock student growth chart data (last 6 months)
        dashboard_data["student_growth"] = [
            {"month": "Mar", "count": 2200},
            {"month": "Apr", "count": 2400},
            {"month": "May", "count": 2550},
            {"month": "Jun", "count": 2700},
            {"month": "Jul", "count": 2800},
            {"month": "Aug", "count": StudentProfile.objects.count()}
        ]
        
        # Most popular skills chart data
        popular_skills = []
        all_skills = Skill.objects.all()
        for s in all_skills:
            cnt = s.student_skills.count()
            if cnt > 0:
                popular_skills.append({"name": s.name, "count": cnt})
        popular_skills = sorted(popular_skills, key=lambda x: x["count"], reverse=True)[:5]
        if not popular_skills:
            popular_skills = [
                {"name": "React", "count": 12},
                {"name": "Python", "count": 10},
                {"name": "Java", "count": 8},
                {"name": "Django", "count": 7},
                {"name": "JavaScript", "count": 5}
            ]
        dashboard_data["popular_skills"] = popular_skills
        
        # User management list
        users = User.objects.all().order_by("-date_joined")
        dashboard_data["users"] = [{
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "date_joined": u.date_joined.isoformat()
        } for u in users]
        
        # Opportunities list
        opps = Opportunity.objects.all().order_by("-date_posted")
        dashboard_data["opportunities"] = [serialize_opportunity(o) for o in opps]
        
    context = {
        "dashboard_data": dashboard_data,
        "user_role": user.role.lower()
    }
    
    return render(request, "dashboard/dashboard.html", context)


# JSON POST ACTION VIEWS (Student Actions)

def get_json_body(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except Exception:
        return {}


@login_required
@require_POST
def student_update_profile(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    
    profile.full_name = data.get("full_name", profile.full_name)
    profile.bio = data.get("bio", profile.bio)
    profile.phone = data.get("phone", profile.phone)
    profile.location = data.get("location", profile.location)
    profile.college = data.get("college", profile.college)
    profile.department = data.get("department", profile.department)
    profile.graduation_year = int(data.get("graduation_year")) if data.get("graduation_year") else None
    profile.career_objective = data.get("career_objective", profile.career_objective)
    profile.preferred_job_roles = data.get("preferred_job_roles", profile.preferred_job_roles)
    profile.preferred_industries = data.get("preferred_industries", profile.preferred_industries)
    profile.work_preference = data.get("work_preference", profile.work_preference)
    profile.experience_level = data.get("experience_level", profile.experience_level)
    profile.linkedin = data.get("linkedin", profile.linkedin)
    profile.github = data.get("github", profile.github)
    profile.portfolio_url = data.get("portfolio_url", profile.portfolio_url)
    
    profile.save()
    
    return JsonResponse({
        "status": "success",
        "profile": serialize_student_profile(profile),
        "profile_strength": profile.profile_strength
    })


@login_required
@require_POST
def student_add_skill(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    skill_id = data.get("skill_id")
    level = data.get("level", "beginner")
    years_experience = float(data.get("years_experience", 0))
    
    skill = get_object_or_404(Skill, id=skill_id)
    
    try:
        student_skill = StudentSkill.objects.create(
            student=profile,
            skill=skill,
            level=level,
            years_experience=years_experience,
            verification_status="pending"
        )
        return JsonResponse({
            "status": "success",
            "skill": serialize_student_skill(student_skill),
            "career_score": profile.career_score
        })
    except IntegrityError:
        return JsonResponse({"status": "error", "message": "You have already added this skill."}, status=400)


@login_required
@require_POST
def student_delete_skill(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    skill_id = data.get("id")
    
    student_skill = get_object_or_404(StudentSkill, id=skill_id, student=profile)
    student_skill.delete()
    
    return JsonResponse({
        "status": "success",
        "career_score": profile.career_score
    })


@login_required
@require_POST
def student_add_project(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    
    start_date = data.get("start_date") or None
    end_date = data.get("end_date") or None
    
    project = Project.objects.create(
        student=profile,
        name=data.get("name"),
        description=data.get("description"),
        project_type=data.get("project_type", "academic"),
        technologies=data.get("technologies"),
        start_date=start_date,
        end_date=end_date,
        github_url=data.get("github_url", ""),
        live_demo_url=data.get("live_demo_url", ""),
        role=data.get("role", ""),
        team_members=data.get("team_members", ""),
        verification_status="pending"
    )
    
    return JsonResponse({
        "status": "success",
        "project": serialize_project(project),
        "career_score": profile.career_score
    })


@login_required
@require_POST
def student_delete_project(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    project_id = data.get("id")
    
    project = get_object_or_404(Project, id=project_id, student=profile)
    project.delete()
    
    return JsonResponse({
        "status": "success",
        "career_score": profile.career_score
    })


@login_required
@require_POST
def student_add_certificate(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    
    issue_date = data.get("issue_date")
    expiration_date = data.get("expiration_date") or None
    
    cert = Certificate.objects.create(
        student=profile,
        name=data.get("name"),
        issuing_organization=data.get("issuing_organization"),
        issue_date=issue_date,
        expiration_date=expiration_date,
        credential_id=data.get("credential_id", ""),
        credential_url=data.get("credential_url", ""),
        verification_status="pending"
    )
    
    return JsonResponse({
        "status": "success",
        "certificate": serialize_certificate(cert),
        "career_score": profile.career_score
    })


@login_required
@require_POST
def student_delete_certificate(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    cert_id = data.get("id")
    
    cert = get_object_or_404(Certificate, id=cert_id, student=profile)
    cert.delete()
    
    return JsonResponse({
        "status": "success",
        "career_score": profile.career_score
    })


@login_required
@require_POST
def student_add_internship(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    
    start_date = data.get("start_date")
    end_date = data.get("end_date") or None
    
    internship = Internship.objects.create(
        student=profile,
        company_name=data.get("company_name"),
        role=data.get("role"),
        start_date=start_date,
        end_date=end_date,
        description=data.get("description", ""),
        skills=data.get("skills", ""),
        verification_status="pending"
    )
    
    return JsonResponse({
        "status": "success",
        "internship": serialize_internship(internship),
        "career_score": profile.career_score
    })


@login_required
@require_POST
def student_delete_internship(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    internship_id = data.get("id")
    
    internship = get_object_or_404(Internship, id=internship_id, student=profile)
    internship.delete()
    
    return JsonResponse({
        "status": "success",
        "career_score": profile.career_score
    })


@login_required
@require_POST
def student_add_achievement(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    
    achievement = Achievement.objects.create(
        student=profile,
        title=data.get("title"),
        category=data.get("category", "other"),
        description=data.get("description", ""),
        issuer=data.get("issuer", ""),
        issue_date=data.get("issue_date")
    )
    
    return JsonResponse({
        "status": "success",
        "achievement": serialize_achievement(achievement),
        "career_score": profile.career_score
    })


@login_required
@require_POST
def student_delete_achievement(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    achievement_id = data.get("id")
    
    achievement = get_object_or_404(Achievement, id=achievement_id, student=profile)
    achievement.delete()
    
    return JsonResponse({
        "status": "success",
        "career_score": profile.career_score
    })


@login_required
@require_POST
def student_add_research(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    type_ = data.get("type")  # "seminar" or "research_paper"
    
    if type_ == "seminar":
        seminar = Seminar.objects.create(
            student=profile,
            topic=data.get("topic"),
            institution=data.get("institution"),
            date=data.get("date"),
            verification_status="pending"
        )
        return JsonResponse({
            "status": "success",
            "type": "seminar",
            "item": serialize_seminar(seminar),
            "career_score": profile.career_score
        })
    elif type_ == "research_paper":
        paper = ResearchPaper.objects.create(
            student=profile,
            title=data.get("title"),
            authors=data.get("authors"),
            publication=data.get("publication"),
            publication_date=data.get("publication_date"),
            paper_url=data.get("paper_url", ""),
            verification_status="pending"
        )
        return JsonResponse({
            "status": "success",
            "type": "research_paper",
            "item": serialize_research_paper(paper),
            "career_score": profile.career_score
        })
    else:
        return JsonResponse({"status": "error", "message": "Invalid type"}, status=400)


@login_required
@require_POST
def student_delete_research(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    type_ = data.get("type")
    id_ = data.get("id")
    
    if type_ == "seminar":
        item = get_object_or_404(Seminar, id=id_, student=profile)
        item.delete()
    elif type_ == "research_paper":
        item = get_object_or_404(ResearchPaper, id=id_, student=profile)
        item.delete()
    else:
        return JsonResponse({"status": "error", "message": "Invalid type"}, status=400)
        
    return JsonResponse({
        "status": "success",
        "career_score": profile.career_score
    })


@login_required
@require_POST
def student_apply_opportunity(request):
    if request.user.role != User.Role.STUDENT:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    profile = request.user.studentprofile
    opp_id = data.get("opportunity_id")
    
    opp = get_object_or_404(Opportunity, id=opp_id)
    
    try:
        OpportunityApplication.objects.create(
            student=profile,
            opportunity=opp,
            status="applied"
        )
        
        # Trigger dynamic notification to student
        Notification.objects.create(
            user=request.user,
            text=f"Successfully applied for '{opp.job_title}' at {opp.company_name}."
        )
        
        return JsonResponse({"status": "success"})
    except IntegrityError:
        return JsonResponse({"status": "error", "message": "You have already applied for this opportunity."}, status=400)


# FACULTY ACTIONS

@login_required
@require_POST
def faculty_verify_item(request):
    if request.user.role != User.Role.FACULTY:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    item_type = data.get("type")  # "skill", "project", "certificate", "internship", "seminar", "research_paper"
    item_id = data.get("id")
    action = data.get("action")  # "approve" or "reject"
    feedback = data.get("feedback", "")
    
    if action not in ["approved", "rejected"]:
        action = "approved" if action == "approve" else "rejected"
        
    target_item = None
    student_user = None
    item_name = ""
    
    with transaction.atomic():
        if item_type == "skill":
            target_item = get_object_or_404(StudentSkill, id=item_id)
            item_name = target_item.skill.name
        elif item_type == "project":
            target_item = get_object_or_404(Project, id=item_id)
            item_name = target_item.name
        elif item_type == "certificate":
            target_item = get_object_or_404(Certificate, id=item_id)
            item_name = target_item.name
        elif item_type == "internship":
            target_item = get_object_or_404(Internship, id=item_id)
            item_name = f"Internship at {target_item.company_name}"
        elif item_type == "seminar":
            target_item = get_object_or_404(Seminar, id=item_id)
            item_name = target_item.topic
        elif item_type == "research_paper":
            target_item = get_object_or_404(ResearchPaper, id=item_id)
            item_name = target_item.title
        else:
            return JsonResponse({"status": "error", "message": "Invalid item type"}, status=400)
            
        target_item.verification_status = action
        target_item.verified_by = request.user
        target_item.verified_at = timezone.now()
        target_item.faculty_feedback = feedback
        target_item.save()
        
        student_user = target_item.student.user
        
        # Create notification
        status_text = "verified and approved" if action == "approved" else "rejected"
        feedback_note = f" Feedback: {feedback}" if feedback else ""
        Notification.objects.create(
            user=student_user,
            text=f"Your {item_type} '{item_name}' has been {status_text} by Faculty.{feedback_note}"
        )
        
    return JsonResponse({"status": "success"})


@login_required
@require_POST
def faculty_add_feedback(request):
    if request.user.role != User.Role.FACULTY:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    student_id = data.get("student_id")
    feedback_text = data.get("feedback_text")
    
    student = get_object_or_404(StudentProfile, id=student_id)
    faculty = request.user.facultyprofile
    
    feedback = FacultyFeedback.objects.create(
        student=student,
        faculty=faculty,
        feedback_text=feedback_text
    )
    
    # Notify student
    Notification.objects.create(
        user=student.user,
        text=f"Faculty {request.user.username} added mentoring feedback to your profile."
    )
    
    return JsonResponse({
        "status": "success",
        "feedback": serialize_feedback(feedback)
    })


# ADMIN ACTIONS

@login_required
@require_POST
def admin_add_faculty(request):
    if not (request.user.role == User.Role.ADMIN or request.user.is_superuser):
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    
    employee_id = data.get("employee_id", "")
    department = data.get("department", "")
    designation = data.get("designation", "")
    
    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role=User.Role.FACULTY
            )
            FacultyProfile.objects.create(
                user=user,
                full_name=username,
                employee_id=employee_id,
                department=department,
                designation=designation
            )
        return JsonResponse({
            "status": "success",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "date_joined": user.date_joined.isoformat()
            }
        })
    except IntegrityError:
        return JsonResponse({"status": "error", "message": "Username already exists."}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@login_required
@require_POST
def admin_delete_user(request):
    if not (request.user.role == User.Role.ADMIN or request.user.is_superuser):
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    user_id = data.get("id")
    
    if user_id == request.user.id:
        return JsonResponse({"status": "error", "message": "You cannot delete your own admin account."}, status=400)
        
    user = get_object_or_404(User, id=user_id)
    user.delete()
    
    return JsonResponse({"status": "success"})


@login_required
@require_POST
def admin_add_opportunity(request):
    if not (request.user.role == User.Role.ADMIN or request.user.is_superuser or request.user.role == User.Role.FACULTY):
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    
    opp = Opportunity.objects.create(
        job_title=data.get("job_title"),
        company_name=data.get("company_name"),
        description=data.get("description"),
        required_skills=data.get("required_skills"),
        preferred_skills=data.get("preferred_skills", ""),
        location=data.get("location"),
        job_type=data.get("job_type", "internship"),
        salary=data.get("salary", "")
    )
    
    # Notify students matching above 70%
    students = StudentProfile.objects.all()
    for s in students:
        serialized_opp = serialize_opportunity(opp, s)
        if serialized_opp["match_score"] >= 70:
            Notification.objects.create(
                user=s.user,
                text=f"New matching opportunity: '{opp.job_title}' at {opp.company_name} ({serialized_opp['match_score']}% match)."
            )
            
    return JsonResponse({
        "status": "success",
        "opportunity": serialize_opportunity(opp)
    })


@login_required
@require_POST
def admin_delete_opportunity(request):
    if not (request.user.role == User.Role.ADMIN or request.user.is_superuser or request.user.role == User.Role.FACULTY):
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    data = get_json_body(request)
    opp_id = data.get("id")
    
    opp = get_object_or_404(Opportunity, id=opp_id)
    opp.delete()
    
    return JsonResponse({"status": "success"})


@login_required
@require_POST
def notifications_read_all(request):
    request.user.notifications.filter(is_read=False).update(is_read=True)
    return JsonResponse({"status": "success"})


@login_required
def faculty_student_detail(request, student_id):
    if request.user.role != User.Role.FACULTY:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
        
    student = get_object_or_404(StudentProfile, id=student_id)
    
    return JsonResponse({
        "status": "success",
        "skills": [serialize_student_skill(s) for s in student.skills.all()],
        "projects": [serialize_project(p) for p in student.projects.all()],
        "certificates": [serialize_certificate(c) for c in student.certificates.all()],
        "internships": [serialize_internship(i) for i in student.internships.all()],
        "achievements": [serialize_achievement(a) for a in student.achievements.all()],
        "feedbacks": [serialize_feedback(f) for f in student.feedbacks.all().order_by("-created_at")]
    })


# PUBLIC PORTFOLIO RENDER
def public_portfolio(request, username):
    user = get_object_or_404(User, username=username, role=User.Role.STUDENT)
    profile = user.studentprofile
    
    skills = profile.skills.filter(verification_status="approved").select_related("skill")
    projects = profile.projects.filter(verification_status="approved").order_by("-created_at")
    certs = profile.certificates.filter(verification_status="approved").order_by("-created_at")
    internships = profile.internships.filter(verification_status="approved").order_by("-created_at")
    achievements = profile.achievements.all().order_by("-created_at")
    seminars = profile.seminars.filter(verification_status="approved").order_by("-created_at")
    papers = profile.research_papers.filter(verification_status="approved").order_by("-created_at")
    
    # Process comma-separated strings for template convenience
    for p in projects:
        p.tech_list = [t.strip() for t in p.technologies.split(",") if t.strip()]
        
    for i in internships:
        i.skill_list = [s.strip() for s in i.skills.split(",") if s.strip()]
        
    context = {
        "profile": profile,
        "skills": skills,
        "projects": projects,
        "certificates": certs,
        "internships": internships,
        "achievements": achievements,
        "seminars": seminars,
        "research_papers": papers,
        "career_score": profile.career_score
    }
    
    return render(request, "student/portfolio.html", context)