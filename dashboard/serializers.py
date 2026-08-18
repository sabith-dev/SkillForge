import datetime
from accounts.models import User
from students.models import (
    StudentProfile, Skill, StudentSkill, Project, Certificate,
    Internship, Achievement, Seminar, ResearchPaper, Opportunity,
    OpportunityApplication, FacultyFeedback, Notification
)

def format_date(d):
    if isinstance(d, (datetime.date, datetime.datetime)):
        return d.isoformat()
    return ""

def serialize_user(user):
    if not user:
        return None
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_superuser": user.is_superuser
    }

def serialize_student_profile(profile):
    if not profile:
        return None
    return {
        "id": profile.id,
        "full_name": profile.full_name,
        "bio": profile.bio,
        "phone": profile.phone,
        "location": profile.location,
        "college": profile.college,
        "department": profile.department,
        "graduation_year": profile.graduation_year,
        "career_objective": profile.career_objective,
        "preferred_job_roles": profile.preferred_job_roles,
        "preferred_industries": profile.preferred_industries,
        "work_preference": profile.work_preference,
        "experience_level": profile.experience_level,
        "linkedin": profile.linkedin,
        "github": profile.github,
        "portfolio_url": profile.portfolio_url,
        "profile_photo_url": profile.profile_photo.url if profile.profile_photo else "",
        "resume_url": profile.resume.url if profile.resume else ""
    }

def serialize_student_skill(student_skill):
    return {
        "id": student_skill.id,
        "skill_id": student_skill.skill.id,
        "name": student_skill.skill.name,
        "category": student_skill.skill.category,
        "category_display": student_skill.skill.get_category_display(),
        "level": student_skill.level,
        "level_display": student_skill.get_level_display(),
        "years_experience": float(student_skill.years_experience),
        "verification_status": student_skill.verification_status,
        "faculty_feedback": student_skill.faculty_feedback,
        "verified_by": student_skill.verified_by.username if student_skill.verified_by else ""
    }

def serialize_project(project):
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "project_type": project.project_type,
        "project_type_display": project.get_project_type_display(),
        "technologies": project.technologies,
        "start_date": format_date(project.start_date),
        "end_date": format_date(project.end_date),
        "github_url": project.github_url,
        "live_demo_url": project.live_demo_url,
        "role": project.role,
        "team_members": project.team_members,
        "verification_status": project.verification_status,
        "faculty_feedback": project.faculty_feedback,
        "verified_by": project.verified_by.username if project.verified_by else ""
    }

def serialize_certificate(cert):
    return {
        "id": cert.id,
        "name": cert.name,
        "issuing_organization": cert.issuing_organization,
        "issue_date": format_date(cert.issue_date),
        "expiration_date": format_date(cert.expiration_date),
        "credential_id": cert.credential_id,
        "credential_url": cert.credential_url,
        "verification_status": cert.verification_status,
        "faculty_feedback": cert.faculty_feedback,
        "verified_by": cert.verified_by.username if cert.verified_by else ""
    }

def serialize_internship(internship):
    return {
        "id": internship.id,
        "company_name": internship.company_name,
        "role": internship.role,
        "start_date": format_date(internship.start_date),
        "end_date": format_date(internship.end_date),
        "description": internship.description,
        "skills": internship.skills,
        "verification_status": internship.verification_status,
        "faculty_feedback": internship.faculty_feedback,
        "verified_by": internship.verified_by.username if internship.verified_by else ""
    }

def serialize_achievement(achievement):
    return {
        "id": achievement.id,
        "title": achievement.title,
        "category": achievement.category,
        "category_display": achievement.get_category_display(),
        "description": achievement.description,
        "issuer": achievement.issuer,
        "issue_date": format_date(achievement.issue_date)
    }

def serialize_seminar(seminar):
    return {
        "id": seminar.id,
        "topic": seminar.topic,
        "institution": seminar.institution,
        "date": format_date(seminar.date),
        "verification_status": seminar.verification_status,
        "faculty_feedback": seminar.faculty_feedback,
        "verified_by": seminar.verified_by.username if seminar.verified_by else ""
    }

def serialize_research_paper(paper):
    return {
        "id": paper.id,
        "title": paper.title,
        "authors": paper.authors,
        "publication": paper.publication,
        "publication_date": format_date(paper.publication_date),
        "paper_url": paper.paper_url,
        "verification_status": paper.verification_status,
        "faculty_feedback": paper.faculty_feedback,
        "verified_by": paper.verified_by.username if paper.verified_by else ""
    }

def serialize_opportunity(opp, student_profile=None):
    data = {
        "id": opp.id,
        "job_title": opp.job_title,
        "company_name": opp.company_name,
        "description": opp.description,
        "required_skills": opp.required_skills,
        "preferred_skills": opp.preferred_skills,
        "location": opp.location,
        "job_type": opp.job_type,
        "job_type_display": opp.get_job_type_display(),
        "salary": opp.salary,
        "date_posted": format_date(opp.date_posted)
    }
    
    # Calculate match score if student profile is provided
    if student_profile:
        # Get student's verified skills
        student_skills = set(
            s.skill.name.lower().strip()
            for s in student_profile.skills.filter(verification_status="approved")
        )
        
        req_list = [s.strip().lower() for s in opp.required_skills.split(",") if s.strip()]
        pref_list = [s.strip().lower() for s in opp.preferred_skills.split(",") if s.strip()]
        
        matched_req = [s for s in req_list if s in student_skills]
        matched_pref = [s for s in pref_list if s in student_skills]
        
        total_req = len(req_list)
        if total_req > 0:
            # 80% weight to required skills, 20% weight to preferred skills
            req_score = (len(matched_req) / total_req) * 80
            pref_score = 0
            if len(pref_list) > 0:
                pref_score = (len(matched_pref) / len(pref_list)) * 20
            else:
                pref_score = 20 # Full bonus if no preferred skills listed
            
            match_score = round(req_score + pref_score)
        else:
            match_score = 100
            
        data["match_score"] = match_score
        data["matched_required"] = matched_req
        data["missing_required"] = [s for s in req_list if s not in student_skills]
        data["matched_preferred"] = matched_pref
        data["missing_preferred"] = [s for s in pref_list if s not in student_skills]
        
        # Check if student applied
        data["applied"] = OpportunityApplication.objects.filter(student=student_profile, opportunity=opp).exists()
        
    return data

def serialize_feedback(feedback):
    return {
        "id": feedback.id,
        "faculty_name": feedback.faculty.full_name or feedback.faculty.user.username,
        "feedback_text": feedback.feedback_text,
        "created_at": format_date(feedback.created_at)
    }

def serialize_notification(notification):
    return {
        "id": notification.id,
        "text": notification.text,
        "is_read": notification.is_read,
        "created_at": format_date(notification.created_at)
    }

def serialize_faculty_profile(profile):
    if not profile:
        return None
    return {
        "id": profile.id,
        "full_name": profile.full_name,
        "employee_id": profile.employee_id,
        "department": profile.department,
        "designation": profile.designation,
        "phone": profile.phone,
        "bio": profile.bio,
        "profile_photo_url": profile.profile_photo.url if profile.profile_photo else ""
    }
