"""
Seed script: registers 5 students + 5 faculty with rich demo data.

Run from the project root:
    venv\\Scripts\\python seed_data.py

Idempotent: re-running deletes and recreates the seed users below.
Login credentials: username / demo12345
"""
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django

django.setup()

from datetime import date

from django.utils import timezone

from accounts.models import User
from faculty.models import FacultyProfile
from dashboard.views import populate_default_skills
from students.models import (
    Achievement, Certificate, FacultyFeedback, Internship, Notification,
    Opportunity, Project, ResearchPaper, Seminar, Skill, StudentProfile,
    StudentSkill,
)

PASSWORD = "demo12345"

FACULTY = [
    {
        "username": "suresh", "full_name": "Dr. Suresh Kumar", "employee_id": "FAC001",
        "department": "Computer Science", "designation": "Professor",
        "phone": "+91 98470 00001",
        "bio": "Professor of Computer Science with 18 years of experience in software engineering, databases and distributed systems.",
    },
    {
        "username": "lakshmi", "full_name": "Dr. Lakshmi Iyer", "employee_id": "FAC002",
        "department": "Information Technology", "designation": "Associate Professor",
        "phone": "+91 98470 00002",
        "bio": "Researcher in cybersecurity and networking. Mentors students on secure coding and cloud infrastructure.",
    },
    {
        "username": "rajesh", "full_name": "Prof. Rajesh Nambiar", "employee_id": "FAC003",
        "department": "AI & Data Science", "designation": "Assistant Professor",
        "phone": "+91 98470 00003",
        "bio": "Specializes in machine learning and data analytics. Guides student research and competitive coding teams.",
    },
    {
        "username": "divya", "full_name": "Dr. Divya Pillai", "employee_id": "FAC004",
        "department": "Computer Science", "designation": "Assistant Professor",
        "phone": "+91 98470 00004",
        "bio": "Expert in artificial intelligence and human-computer interaction. Published 25+ international papers.",
    },
    {
        "username": "anil", "full_name": "Prof. Anil George", "employee_id": "FAC005",
        "department": "Software Engineering", "designation": "Professor",
        "phone": "+91 98470 00005",
        "bio": "Full-stack software engineering lead with industry experience at top product companies.",
    },
]

STUDENTS = [
    {
        "username": "aarav", "full_name": "Aarav Sharma", "role": User.Role.STUDENT,
        "phone": "+91 98470 10001", "location": "Kochi, Kerala",
        "college": "Mar Athanasius College of Engineering", "department": "Computer Science",
        "graduation_year": 2026, "work_preference": "Hybrid", "experience_level": "Junior",
        "career_objective": ("Seeking a backend engineering role where I can build scalable systems "
                             "with Python, Django and PostgreSQL."),
        "preferred_job_roles": "Backend Developer, Software Engineer",
        "preferred_industries": "Fintech, SaaS",
        "linkedin": "https://linkedin.com/in/aaravsharma",
        "github": "https://github.com/aaravsharma",
        "portfolio_url": "https://aaravsharma.dev",
        "skills": [
            ("Python", "advanced", 3.0, "approved"),
            ("Django", "advanced", 2.5, "approved"),
            ("PostgreSQL", "intermediate", 2.0, "approved"),
            ("React", "beginner", 0.5, "pending"),
            ("Docker", "intermediate", 1.0, "pending"),
        ],
        "projects": [
            {
                "name": "SkillForge API Platform",
                "description": "REST API for a student skill verification platform with role-based access, JWT auth and pgvector search.",
                "project_type": "academic", "technologies": "Django, Django REST Framework, PostgreSQL",
                "start_date": date(2025, 6, 1), "end_date": date(2025, 8, 15),
                "github_url": "https://github.com/aaravsharma/skillforge-api",
                "live_demo_url": "https://api.skillforge-demo.dev",
                "role": "Backend Lead", "team_members": "Aarav Sharma, Sneha Reddy", "status": "approved",
            },
            {
                "name": "Expense Tracker",
                "description": "Monthly expense tracking web app with dashboards, budgets and CSV exports.",
                "project_type": "personal", "technologies": "Python, Flask, SQLite",
                "start_date": date(2025, 1, 10), "end_date": date(2025, 2, 20),
                "github_url": "https://github.com/aaravsharma/expense-tracker",
                "live_demo_url": "", "role": "Solo Developer", "team_members": "", "status": "pending",
            },
        ],
        "certificates": [
            {
                "name": "Meta Back-End Developer", "issuing_organization": "Coursera",
                "issue_date": date(2025, 3, 18), "credential_url": "https://coursera.org/verify/ABC123",
                "status": "approved",
            },
            {
                "name": "AWS Certified Cloud Practitioner", "issuing_organization": "Amazon Web Services",
                "issue_date": date(2025, 7, 5), "credential_url": "https://aws.amazon.com/verify/XYZ789",
                "status": "pending",
            },
        ],
        "internships": [
            {
                "company_name": "Zoho Corporation", "role": "Backend Developer Intern",
                "start_date": date(2025, 5, 1), "end_date": date(2025, 7, 31),
                "description": "Built and optimized internal REST services using Django and PostgreSQL, reduced query latency by 40%.",
                "skills": "Python, Django, PostgreSQL, Redis", "status": "approved",
            },
        ],
        "achievements": [
            {
                "title": "Winner - Smart India Hackathon 2025", "category": "hackathon",
                "description": "Team lead for a winning solution on digital literacy for rural communities.",
                "issuer": "Ministry of Education", "issue_date": date(2025, 8, 20),
            },
        ],
        "seminars": [
            {
                "topic": "Introduction to Cloud-Native Architecture",
                "institution": "IEEE Student Chapter", "date": date(2025, 4, 12), "status": "approved",
            },
        ],
    },
    {
        "username": "priya", "full_name": "Priya Nair", "role": User.Role.STUDENT,
        "phone": "+91 98470 10002", "location": "Thiruvananthapuram, Kerala",
        "college": "College of Engineering Trivandrum", "department": "Information Technology",
        "graduation_year": 2026, "work_preference": "Remote", "experience_level": "Junior",
        "career_objective": ("Aspiring frontend engineer focused on creating accessible, high-performance "
                             "interfaces with React."),
        "preferred_job_roles": "Frontend Developer, UI Engineer",
        "preferred_industries": "E-commerce, EdTech",
        "linkedin": "https://linkedin.com/in/priyanair",
        "github": "https://github.com/priyanair",
        "portfolio_url": "https://priyanair.dev",
        "skills": [
            ("JavaScript", "advanced", 2.5, "approved"),
            ("React", "advanced", 2.0, "approved"),
            ("CSS", "advanced", 2.5, "approved"),
            ("TypeScript", "intermediate", 1.5, "approved"),
            ("Next.js", "intermediate", 1.0, "pending"),
            ("Figma", "intermediate", 1.0, "pending"),
        ],
        "projects": [
            {
                "name": "E-Shop PWA",
                "description": "Progressive web app for a fashion store with cart, offline support and payment integration.",
                "project_type": "team", "technologies": "React, Redux, TailwindCSS, Stripe",
                "start_date": date(2025, 3, 1), "end_date": date(2025, 6, 30),
                "github_url": "https://github.com/priyanair/eshopt-pwa",
                "live_demo_url": "https://eshop-pwa-demo.netlify.app",
                "role": "Frontend Developer", "team_members": "Priya Nair, Arjun Menon", "status": "approved",
            },
            {
                "name": "Portfolio Site",
                "description": "Personal portfolio built with Next.js showcasing projects and design work.",
                "project_type": "personal", "technologies": "Next.js, TailwindCSS",
                "start_date": date(2025, 8, 1), "end_date": None,
                "github_url": "https://github.com/priyanair/portfolio",
                "live_demo_url": "https://priyanair.dev",
                "role": "Solo Developer", "team_members": "", "status": "pending",
            },
        ],
        "certificates": [
            {
                "name": "Frontend Development with React", "issuing_organization": "Coursera",
                "issue_date": date(2025, 2, 14), "credential_url": "https://coursera.org/verify/PQR456",
                "status": "approved",
            },
            {
                "name": "Responsive Web Design", "issuing_organization": "freeCodeCamp",
                "issue_date": date(2024, 12, 10), "credential_url": "https://freecodecamp.org/cert/priya",
                "status": "approved",
            },
        ],
        "internships": [
            {
                "company_name": "Freshworks", "role": "Frontend Developer Intern",
                "start_date": date(2025, 5, 15), "end_date": date(2025, 8, 15),
                "description": "Worked on the CRM dashboard UI, component library and accessibility improvements.",
                "skills": "React, TypeScript, CSS", "status": "approved",
            },
        ],
        "achievements": [
            {
                "title": "1st Place - GeeksForGeeks UI Design Contest", "category": "competition",
                "description": "Won campus UI design contest with a dark-mode design system.",
                "issuer": "GeeksForGeeks", "issue_date": date(2025, 3, 25),
            },
        ],
    },
    {
        "username": "faisal", "full_name": "Mohammed Faisal", "role": User.Role.STUDENT,
        "phone": "+91 98470 10003", "location": "Kozhikode, Kerala",
        "college": "National Institute of Technology Calicut", "department": "Computer Science",
        "graduation_year": 2025, "work_preference": "On-site", "experience_level": "Mid",
        "career_objective": ("Full-stack developer with a passion for DevOps and containerized deployments. "
                             "Aiming to ship reliable products at scale."),
        "preferred_job_roles": "Full Stack Developer, DevOps Engineer",
        "preferred_industries": "Cloud, SaaS",
        "linkedin": "https://linkedin.com/in/mohammedfaisal",
        "github": "https://github.com/faisaldev",
        "portfolio_url": "https://faisal.dev",
        "skills": [
            ("Python", "intermediate", 2.0, "approved"),
            ("Django", "advanced", 2.0, "approved"),
            ("React", "advanced", 2.5, "approved"),
            ("Node.js", "intermediate", 1.5, "approved"),
            ("Docker", "advanced", 2.0, "approved"),
            ("Git", "advanced", 3.0, "pending"),
            ("Redis", "beginner", 0.5, "rejected"),
        ],
        "projects": [
            {
                "name": "DeployHub",
                "description": "CI/CD dashboard that auto-deploys student projects to containers with rollback support.",
                "project_type": "hackathon", "technologies": "React, Node.js, Docker, Kubernetes",
                "start_date": date(2025, 6, 1), "end_date": date(2025, 8, 1),
                "github_url": "https://github.com/faisaldev/deployhub",
                "live_demo_url": "", "role": "Full Stack Developer", "team_members": "Faisal, Aarav", "status": "approved",
            },
            {
                "name": "Chat App",
                "description": "Real-time group chat with WebSockets, typing indicators and read receipts.",
                "project_type": "personal", "technologies": "Node.js, Express, Socket.IO, MongoDB",
                "start_date": date(2024, 10, 1), "end_date": date(2024, 11, 15),
                "github_url": "https://github.com/faisaldev/chatapp",
                "live_demo_url": "https://chatapp-faisal.herokuapp.com",
                "role": "Solo Developer", "team_members": "", "status": "pending",
            },
        ],
        "certificates": [
            {
                "name": "Docker for Beginners", "issuing_organization": "Udemy",
                "issue_date": date(2025, 4, 2), "credential_url": "https://udemy.com/certificate/DE123",
                "status": "approved",
            },
            {
                "name": "Kubernetes Fundamentals", "issuing_organization": "KodeKloud",
                "issue_date": date(2025, 6, 20), "credential_url": "https://kodekloud.com/verify/K8S88",
                "status": "pending",
            },
        ],
        "internships": [
            {
                "company_name": "Tata Consultancy Services", "role": "Software Engineer Intern",
                "start_date": date(2024, 12, 1), "end_date": date(2025, 3, 31),
                "description": "Developed internal dashboard microservices and containerized legacy tools.",
                "skills": "Java, React, Docker", "status": "approved",
            },
        ],
        "achievements": [
            {
                "title": "Runner-up - Hackverse 2025", "category": "hackathon",
                "description": "Built an AI-powered resume reviewer within 36 hours.",
                "issuer": "Hackverse", "issue_date": date(2025, 2, 8),
            },
        ],
    },
    {
        "username": "sneha", "full_name": "Sneha Reddy", "role": User.Role.STUDENT,
        "phone": "+91 98470 10004", "location": "Bengaluru, Karnataka",
        "college": "BMS College of Engineering", "department": "AI & Data Science",
        "graduation_year": 2026, "work_preference": "Hybrid", "experience_level": "Junior",
        "career_objective": ("Data-driven developer interested in machine learning pipelines, research "
                             "publication and analytics."),
        "preferred_job_roles": "Data Scientist, ML Engineer",
        "preferred_industries": "Healthcare AI, Analytics",
        "linkedin": "https://linkedin.com/in/snehareddy",
        "github": "https://github.com/snehareddy",
        "portfolio_url": "https://snehareddy.dev",
        "skills": [
            ("Python", "advanced", 3.0, "approved"),
            ("PostgreSQL", "intermediate", 2.0, "approved"),
            ("MySQL", "intermediate", 1.5, "approved"),
            ("Docker", "beginner", 0.5, "pending"),
        ],
        "projects": [
            {
                "name": "HealthSense",
                "description": "ML pipeline predicting disease risk from wearable data streams with explainable AI.",
                "project_type": "academic", "technologies": "Python, scikit-learn, PostgreSQL, Docker",
                "start_date": date(2025, 1, 1), "end_date": date(2025, 5, 30),
                "github_url": "https://github.com/snehareddy/healthsense",
                "live_demo_url": "", "role": "ML Engineer", "team_members": "Sneha Reddy, Dr. Divya Pillai", "status": "pending",
            },
            {
                "name": "News Classifier",
                "description": "NLP model classifying news articles into topics with 94% accuracy.",
                "project_type": "personal", "technologies": "Python, TensorFlow, FastAPI",
                "start_date": date(2024, 9, 1), "end_date": date(2024, 12, 20),
                "github_url": "https://github.com/snehareddy/newsclassifier",
                "live_demo_url": "", "role": "Solo Developer", "team_members": "", "status": "approved",
            },
        ],
        "certificates": [
            {
                "name": "Machine Learning Specialization", "issuing_organization": "Stanford / Coursera",
                "issue_date": date(2025, 2, 25), "credential_url": "https://coursera.org/verify/ML987",
                "status": "approved",
            },
        ],
        "internships": [
            {
                "company_name": "Siemens Healthineers", "role": "Data Analytics Intern",
                "start_date": date(2025, 6, 1), "end_date": date(2025, 8, 31),
                "description": "Built automated dashboards and anomaly detection for medical imaging logs.",
                "skills": "Python, SQL, Power BI", "status": "pending",
            },
        ],
        "achievements": [
            {
                "title": "Best Paper - National Student Conference", "category": "academic",
                "description": "Presented research on lightweight ML models for edge health devices.",
                "issuer": "IEEE", "issue_date": date(2025, 4, 18),
            },
        ],
        "research_papers": [
            {
                "title": "Edge ML for Wearable Health Monitoring",
                "authors": "Sneha Reddy, Dr. Divya Pillai",
                "publication": "IEEE National Conference", "publication_date": date(2025, 4, 18),
                "paper_url": "https://doi.org/example-edge-ml", "status": "approved",
            },
            {
                "title": "A Survey of Explainable AI Methods",
                "authors": "Sneha Reddy", "publication": "Student Research Journal",
                "publication_date": date(2025, 7, 1), "paper_url": "", "status": "pending",
            },
        ],
        "seminars": [
            {
                "topic": "Responsible AI and Bias Mitigation",
                "institution": "IEEE Student Chapter", "date": date(2025, 3, 15), "status": "approved",
            },
        ],
    },
    {
        "username": "arjun", "full_name": "Arjun Menon", "role": User.Role.STUDENT,
        "phone": "+91 98470 10005", "location": "Palakkad, Kerala",
        "college": "Government Engineering College Thrissur", "department": "Information Technology",
        "graduation_year": 2027, "work_preference": "Remote", "experience_level": "Intern",
        "career_objective": ("Learning a little of everything — web, backend and data. Looking for internships "
                             "to turn curiosity into craft."),
        "preferred_job_roles": "Software Engineer Intern, Full Stack Developer",
        "preferred_industries": "EdTech, Gaming",
        "linkedin": "https://linkedin.com/in/arjunmenon",
        "github": "https://github.com/arjunmenon",
        "portfolio_url": "",
        "skills": [
            ("Python", "intermediate", 1.5, "approved"),
            ("JavaScript", "intermediate", 1.5, "approved"),
            ("React", "beginner", 0.5, "approved"),
            ("Git", "intermediate", 1.0, "pending"),
            ("Node.js", "beginner", 0.5, "pending"),
        ],
        "projects": [
            {
                "name": "Campus Connect",
                "description": "Event and club management platform for college campuses with RSVPs and announcements.",
                "project_type": "team", "technologies": "Django, PostgreSQL, Bootstrap",
                "start_date": date(2025, 7, 1), "end_date": date(2025, 9, 15),
                "github_url": "https://github.com/arjunmenon/campusconnect",
                "live_demo_url": "", "role": "Backend Developer", "team_members": "Arjun Menon, Priya Nair", "status": "pending",
            },
        ],
        "certificates": [
            {
                "name": "CS50: Introduction to Computer Science", "issuing_organization": "Harvard / edX",
                "issue_date": date(2025, 5, 10), "credential_url": "https://cs50.harvard.edu/cert/arjun",
                "status": "approved",
            },
        ],
        "achievements": [
            {
                "title": "Top 10 - Bytecode Programming Contest", "category": "coding",
                "description": "Ranked 8th among 500 participants in state-level competitive coding event.",
                "issuer": "Bytecode", "issue_date": date(2025, 2, 15),
            },
            {
                "title": "Badminton Team Captain", "category": "sports",
                "description": "Led college team to inter-collegiate runner-up.",
                "issuer": "Sports Council", "issue_date": date(2025, 1, 10),
            },
        ],
    },
]

OPPORTUNITIES = [
    {
        "job_title": "Software Engineering Intern",
        "company_name": "Google", "description": "12-week paid internship on consumer products.",
        "required_skills": "Python, Data Structures", "preferred_skills": "Docker, Git",
        "location": "Bengaluru", "job_type": "internship", "salary": "₹60,000/month",
    },
    {
        "job_title": "Frontend Developer",
        "company_name": "Flipkart", "description": "Build the next-gen web storefront with React.",
        "required_skills": "React, JavaScript", "preferred_skills": "TypeScript, CSS",
        "location": "Bengaluru", "job_type": "full_time", "salary": "₹18 LPA",
    },
    {
        "job_title": "Data Science Trainee",
        "company_name": "Amazon", "description": "Work with forecasting and supply-chain analytics teams.",
        "required_skills": "Python, PostgreSQL", "preferred_skills": "Docker, Git",
        "location": "Hyderabad", "job_type": "internship", "salary": "₹50,000/month",
    },
    {
        "job_title": "Backend Developer",
        "company_name": "Zoho", "description": "Harden and scale Django services powering CRM products.",
        "required_skills": "Django, PostgreSQL", "preferred_skills": "Redis, Docker",
        "location": "Chennai", "job_type": "full_time", "salary": "₹14 LPA",
    },
    {
        "job_title": "UI/UX Design Intern",
        "company_name": "CRED", "description": "Assist the design team with interface and design-system work.",
        "required_skills": "Figma, CSS", "preferred_skills": "React, HTML",
        "location": "Bengaluru", "job_type": "internship", "salary": "₹40,000/month",
    },
]


def main():
    # 1. Ensure the shared skill catalog exists
    populate_default_skills()

    # 2. Remove any previously seeded users (idempotent)
    seed_names = [f["username"] for f in FACULTY] + [s["username"] for s in STUDENTS]
    User.objects.filter(username__in=seed_names).delete()

    # 3. Create faculty
    faculty_users = []
    for f in FACULTY:
        user = User.objects.create_user(
            username=f["username"], password=PASSWORD,
            email=f"{f['username']}@skillforge.edu", role=User.Role.FACULTY,
        )
        FacultyProfile.objects.create(
            user=user, full_name=f["full_name"], employee_id=f["employee_id"],
            department=f["department"], designation=f["designation"],
            phone=f["phone"], bio=f["bio"],
        )
        faculty_users.append(user)
        print(f"  + faculty {f['username']}")

    # 4. Create students with all their data
    skill_cache = {s.name: s for s in Skill.objects.all()}
    for idx, s in enumerate(STUDENTS):
        user = User.objects.create_user(
            username=s["username"], password=PASSWORD,
            email=f"{s['username']}@student.skillforge.edu", role=s["role"],
        )
        profile = StudentProfile.objects.create(
            user=user, full_name=s["full_name"], bio=s.get("bio", ""), phone=s["phone"],
            location=s["location"], college=s["college"], department=s["department"],
            graduation_year=s["graduation_year"], career_objective=s["career_objective"],
            preferred_job_roles=s["preferred_job_roles"],
            preferred_industries=s["preferred_industries"],
            work_preference=s["work_preference"], experience_level=s["experience_level"],
            linkedin=s["linkedin"], github=s["github"], portfolio_url=s.get("portfolio_url", ""),
        )

        # Skills
        for name, level, years, status in s["skills"]:
            ss = StudentSkill.objects.create(
                student=profile, skill=skill_cache[name], level=level,
                years_experience=years, verification_status=status,
            )
            if status == "approved":
                verifier = faculty_users[idx % 5]
                ss.verified_by = verifier
                ss.verified_at = timezone.now()
                ss.faculty_feedback = "Skill demonstrated during project reviews and viva. Approved."
            elif status == "rejected":
                ss.verified_by = faculty_users[(idx + 1) % 5]
                ss.verified_at = timezone.now()
                ss.faculty_feedback = "Please attach a verifiable certificate or project link as evidence."
            ss.save()
            Notification.objects.create(user=user, text=(
                f"Your skill '{name}' was {'approved' if status == 'approved' else 'rejected'} by Faculty."
            ))

        # Projects
        for p in s.get("projects", []):
            Project.objects.create(
                student=profile, name=p["name"], description=p["description"],
                project_type=p["project_type"], technologies=p["technologies"],
                start_date=p["start_date"], end_date=p["end_date"],
                github_url=p["github_url"], live_demo_url=p["live_demo_url"],
                role=p["role"], team_members=p["team_members"],
                verification_status=p["status"],
            )

        # Certificates
        for c in s.get("certificates", []):
            Certificate.objects.create(
                student=profile, name=c["name"],
                issuing_organization=c["issuing_organization"],
                issue_date=c["issue_date"], credential_url=c["credential_url"],
                verification_status=c["status"],
            )

        # Internships
        for i in s.get("internships", []):
            Internship.objects.create(
                student=profile, company_name=i["company_name"], role=i["role"],
                start_date=i["start_date"], end_date=i["end_date"],
                description=i["description"], skills=i["skills"],
                verification_status=i["status"],
            )

        # Achievements
        for a in s.get("achievements", []):
            Achievement.objects.create(
                student=profile, title=a["title"], category=a["category"],
                description=a["description"], issuer=a["issuer"],
                issue_date=a["issue_date"],
            )

        # Seminars
        for sem in s.get("seminars", []):
            Seminar.objects.create(
                student=profile, topic=sem["topic"], institution=sem["institution"],
                date=sem["date"], verification_status=sem["status"],
            )

        # Research papers
        for rp in s.get("research_papers", []):
            ResearchPaper.objects.create(
                student=profile, title=rp["title"], authors=rp["authors"],
                publication=rp["publication"], publication_date=rp["publication_date"],
                paper_url=rp["paper_url"], verification_status=rp["status"],
            )

        # A faculty feedback + notification so the student page has mentoring content
        faculty = StudentSkill.objects.filter(student=profile, verification_status="approved").first()
        if faculty:
            fac_user = faculty.verified_by
            fb = FacultyFeedback.objects.create(
                student=profile, faculty=fac_user.facultyprofile,
                feedback_text=(
                    f"Great progress {s['full_name'].split()[-1]}! Keep building real projects and "
                    "documenting your work — your portfolio is on track."
                ),
            )
            Notification.objects.create(
                user=user,
                text=f"Faculty {fac_user.username} added mentoring feedback to your profile.",
            )

        print(f"  + student {s['username']} ({s['full_name']})")

    # 5. Create opportunities
    for o in OPPORTUNITIES:
        opp, created = Opportunity.objects.get_or_create(
            job_title=o["job_title"], company_name=o["company_name"], defaults=o,
        )
        if created:
            print(f"  + opportunity {o['job_title']} @ {o['company_name']}")

    print("\nDone. Login with any username above / %s" % PASSWORD)


if __name__ == "__main__":
    main()