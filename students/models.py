from django.db import models
from django.conf import settings


class StudentProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="studentprofile"
    )

    profile_photo = models.ImageField(
        upload_to="students/profile/",
        blank=True,
        null=True
    )

    full_name = models.CharField(
        max_length=150,
        blank=True
    )

    bio = models.TextField(
        blank=True
    )

    phone = models.CharField(
        max_length=20,
        blank=True
    )

    location = models.CharField(
        max_length=150,
        blank=True
    )

    college = models.CharField(
        max_length=200,
        blank=True
    )

    department = models.CharField(
        max_length=150,
        blank=True
    )

    graduation_year = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    career_objective = models.TextField(
        blank=True
    )

    preferred_job_roles = models.CharField(
        max_length=500,
        blank=True
    )

    preferred_industries = models.CharField(
        max_length=500,
        blank=True
    )

    work_preference = models.CharField(
        max_length=100,
        blank=True
    )

    experience_level = models.CharField(
        max_length=100,
        blank=True
    )

    resume = models.FileField(
        upload_to="students/resumes/",
        blank=True,
        null=True
    )

    linkedin = models.URLField(
        blank=True
    )

    github = models.URLField(
        blank=True
    )

    portfolio_url = models.URLField(
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

    @property
    def profile_strength(self):
        score = 0
        details = []
        
        # 1. Profile photo: 10%
        if self.profile_photo:
            score += 10
            details.append({"name": "Profile photo", "completed": True, "points": 10})
        else:
            details.append({"name": "Profile photo", "completed": False, "points": 10})
            
        # 2. Bio: 10%
        if self.bio and self.bio.strip():
            score += 10
            details.append({"name": "Bio", "completed": True, "points": 10})
        else:
            details.append({"name": "Bio", "completed": False, "points": 10})
            
        # 3. Phone & Location: 10% (5% each)
        phone_valid = bool(self.phone and self.phone.strip())
        loc_valid = bool(self.location and self.location.strip())
        if phone_valid and loc_valid:
            score += 10
            details.append({"name": "Contact & Location", "completed": True, "points": 10})
        else:
            details.append({"name": "Contact & Location", "completed": False, "points": 10})
            
        # 4. College/Dept/Grad Year: 15% (5% each)
        clg = bool(self.college and self.college.strip())
        dept = bool(self.department and self.department.strip())
        grad = self.graduation_year is not None
        if clg and dept and grad:
            score += 15
            details.append({"name": "Education details", "completed": True, "points": 15})
        else:
            details.append({"name": "Education details", "completed": False, "points": 15})
            
        # 5. Career objective & preferences: 15% (5% each)
        obj = bool(self.career_objective and self.career_objective.strip())
        roles = bool(self.preferred_job_roles and self.preferred_job_roles.strip())
        industries = bool(self.preferred_industries and self.preferred_industries.strip())
        if obj and roles and industries:
            score += 15
            details.append({"name": "Career preferences", "completed": True, "points": 15})
        else:
            details.append({"name": "Career preferences", "completed": False, "points": 15})
            
        # 6. Social links: 15% (5% each for LinkedIn, GitHub, Portfolio)
        social_count = sum([bool(self.linkedin), bool(self.github), bool(self.portfolio_url)])
        if social_count == 3:
            score += 15
            details.append({"name": "Social links (GitHub, LinkedIn, Portfolio)", "completed": True, "points": 15})
        else:
            details.append({"name": f"Social links ({social_count}/3)", "completed": False, "points": 15})
            
        # 7. Resume: 25%
        if self.resume:
            score += 25
            details.append({"name": "Resume upload", "completed": True, "points": 25})
        else:
            details.append({"name": "Resume upload", "completed": False, "points": 25})
            
        return {
            "score": score,
            "details": details
        }

    @property
    def career_score(self):
        # Calculate career score details
        # 1. Skills: 2 pts per verified skill (Max 20)
        verified_skills_count = self.skills.filter(verification_status="approved").count()
        skills_points = min(verified_skills_count * 2, 20)
        
        # 2. Projects: 4 pts per verified project (Max 20)
        verified_projects_count = self.projects.filter(verification_status="approved").count()
        projects_points = min(verified_projects_count * 4, 20)
        
        # 3. Certificates: 3 pts per verified certificate (Max 15)
        verified_certs_count = self.certificates.filter(verification_status="approved").count()
        certs_points = min(verified_certs_count * 3, 15)
        
        # 4. Internships: 10 pts per verified internship (Max 20)
        verified_internships_count = self.internships.filter(verification_status="approved").count()
        internships_points = min(verified_internships_count * 10, 20)
        
        # 5. Research & Seminars: 5 pts per verified publication/seminar (Max 10)
        verified_papers_count = self.research_papers.filter(verification_status="approved").count()
        verified_seminars_count = self.seminars.filter(verification_status="approved").count()
        research_points = min((verified_papers_count + verified_seminars_count) * 5, 10)
        
        # 6. Achievements: 3 pts per achievement (Max 15)
        achievements_count = self.achievements.count()
        achievements_points = min(achievements_count * 3, 15)
        
        total = skills_points + projects_points + certs_points + internships_points + research_points + achievements_points
        
        return {
            "total": total,
            "skills": {"score": skills_points, "max": 20, "count": verified_skills_count},
            "projects": {"score": projects_points, "max": 20, "count": verified_projects_count},
            "certificates": {"score": certs_points, "max": 15, "count": verified_certs_count},
            "internships": {"score": internships_points, "max": 20, "count": verified_internships_count},
            "research": {"score": research_points, "max": 10, "count": verified_papers_count + verified_seminars_count},
            "achievements": {"score": achievements_points, "max": 15, "count": achievements_count}
        }


class Skill(models.Model):

    CATEGORY_CHOICES = [
        ("programming", "Programming"),
        ("frontend", "Frontend"),
        ("backend", "Backend"),
        ("database", "Database"),
        ("devops", "DevOps"),
        ("design", "Design"),
        ("other", "Other"),
    ]

    name = models.CharField(
        max_length=100,
        unique=True
    )

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default="other"
    )

    description = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name

class StudentSkill(models.Model):

    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
        ("expert", "Expert"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="skills"
    )

    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="student_skills"
    )

    level = models.CharField(
        max_length=30,
        choices=LEVEL_CHOICES,
        default="beginner"
    )

    years_experience = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=0
    )

    verification_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_student_skills"
    )

    verified_at = models.DateTimeField(
        null=True,
        blank=True
    )

    faculty_feedback = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "skill"],
                name="unique_student_skill"
            )
        ]

    def __str__(self):
        return f"{self.student} - {self.skill}"

class Project(models.Model):
    PROJECT_TYPES = [
        ("academic", "Academic"),
        ("personal", "Personal"),
        ("team", "Team"),
        ("hackathon", "Hackathon"),
        ("freelance", "Freelance"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="projects"
    )

    name = models.CharField(max_length=200)

    description = models.TextField()

    project_type = models.CharField(
        max_length=20,
        choices=PROJECT_TYPES,
        default="academic"
    )

    technologies = models.CharField(
        max_length=500,
        help_text="Example: React, Django, PostgreSQL"
    )

    start_date = models.DateField(
        null=True,
        blank=True
    )

    end_date = models.DateField(
        null=True,
        blank=True
    )

    github_url = models.URLField(
        blank=True
    )

    live_demo_url = models.URLField(
        blank=True
    )

    role = models.CharField(
        max_length=100,
        blank=True
    )

    team_members = models.TextField(
        blank=True
    )

    verification_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_projects"
    )

    verified_at = models.DateTimeField(
        null=True,
        blank=True
    )

    faculty_feedback = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name


class Certificate(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="certificates"
    )
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiration_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True)
    verification_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_certificates"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    faculty_feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Internship(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="internships"
    )
    company_name = models.CharField(max_length=200)
    role = models.CharField(max_length=150)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    skills = models.CharField(
        max_length=500,
        blank=True,
        help_text="Comma-separated skills used"
    )
    verification_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_internships"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    faculty_feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} at {self.company_name}"


class Achievement(models.Model):
    CATEGORY_CHOICES = [
        ("hackathon", "Hackathon"),
        ("competition", "Competition"),
        ("award", "Award / Prize"),
        ("coding", "Coding Contest"),
        ("academic", "Academic Achievement"),
        ("sports", "Sports"),
        ("leadership", "Leadership Activity"),
        ("other", "Other"),
    ]
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="achievements"
    )
    title = models.CharField(max_length=200)
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default="other"
    )
    description = models.TextField(blank=True)
    issuer = models.CharField(max_length=200, blank=True)
    issue_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Seminar(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="seminars"
    )
    topic = models.CharField(max_length=250)
    institution = models.CharField(max_length=200)
    date = models.DateField()
    verification_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_seminars"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    faculty_feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.topic


class ResearchPaper(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="research_papers"
    )
    title = models.CharField(max_length=250)
    authors = models.CharField(max_length=300, help_text="List of authors")
    publication = models.CharField(
        max_length=250,
        help_text="Conference or Journal name"
    )
    publication_date = models.DateField()
    paper_url = models.URLField(blank=True)
    verification_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_research_papers"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    faculty_feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Opportunity(models.Model):
    JOB_TYPES = [
        ("full_time", "Full-time"),
        ("part_time", "Part-time"),
        ("internship", "Internship"),
        ("contract", "Contract"),
    ]
    job_title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    description = models.TextField()
    required_skills = models.CharField(
        max_length=500,
        help_text="Comma-separated list of required skills"
    )
    preferred_skills = models.CharField(
        max_length=500,
        blank=True,
        help_text="Comma-separated list of preferred skills"
    )
    location = models.CharField(max_length=150)
    job_type = models.CharField(
        max_length=30,
        choices=JOB_TYPES,
        default="internship"
    )
    salary = models.CharField(
        max_length=100,
        blank=True,
        help_text="e.g. $25/hr, Unpaid"
    )
    date_posted = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.job_title} at {self.company_name}"


class OpportunityApplication(models.Model):
    STATUS_CHOICES = [
        ("applied", "Applied"),
        ("screening", "Screening"),
        ("interview", "Interviewing"),
        ("offered", "Offered"),
        ("rejected", "Rejected"),
    ]
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="applications"
    )
    opportunity = models.ForeignKey(
        Opportunity,
        on_delete=models.CASCADE,
        related_name="applications"
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="applied"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "opportunity"],
                name="unique_student_application"
            )
        ]

    def __str__(self):
        return f"{self.student} - {self.opportunity}"


class FacultyFeedback(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="feedbacks"
    )
    faculty = models.ForeignKey(
        "faculty.FacultyProfile",
        on_delete=models.CASCADE,
        related_name="feedbacks"
    )
    feedback_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for {self.student} by {self.faculty}"


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    text = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - {self.text[:30]}"