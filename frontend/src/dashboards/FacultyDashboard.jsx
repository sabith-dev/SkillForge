import React, { useState } from "react";

// CSRF Token Helper
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function FacultyDashboard({ initialData }) {
    const [profile, setProfile] = useState(initialData.profile || {});
    const [students, setStudents] = useState(initialData.students || []);
    const [pendingVerifications, setPendingVerifications] = useState(initialData.pending_verifications || {
        skills: [], projects: [], certificates: [], internships: [], seminars: [], research_papers: []
    });
    
    const [activeTab, setActiveTab] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedStudentProfile, setSelectedStudentProfile] = useState(null); // Fetch detail on demand
    const [feedbackText, setFeedbackText] = useState("");
    
    // Verification action states
    const [verifyingItem, setVerifyingItem] = useState(null); // { id, type, name, student }
    const [actionFeedback, setActionFeedback] = useState("");

    const getPendingCount = () => {
        return (
            pendingVerifications.skills.length +
            pendingVerifications.projects.length +
            pendingVerifications.certificates.length +
            pendingVerifications.internships.length +
            pendingVerifications.seminars.length +
            pendingVerifications.research_papers.length
        );
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        const { id, type, action } = verifyingItem;
        
        try {
            const res = await fetch("/api/faculty/verify/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify({
                    id,
                    type,
                    action,
                    feedback: actionFeedback
                })
            });
            if (res.ok) {
                // Update local state by removing the item
                const listKey = type === "research_paper" ? "research_papers" : `${type}s`;
                setPendingVerifications({
                    ...pendingVerifications,
                    [listKey]: pendingVerifications[listKey].filter(item => item.id !== id)
                });
                
                alert(`Item has been ${action === "approve" ? "approved" : "rejected"} successfully.`);
                setVerifyingItem(null);
                setActionFeedback("");
            } else {
                alert("Failed to save verification.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddFeedback = async (e) => {
        e.preventDefault();
        if (!feedbackText.trim()) return;

        try {
            const res = await fetch("/api/faculty/feedback/add/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify({
                    student_id: selectedStudent.id,
                    feedback_text: feedbackText
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Mentoring feedback submitted!");
                setFeedbackText("");
                // Optionally reload the details if needed
                if (selectedStudentProfile) {
                    setSelectedStudentProfile({
                        ...selectedStudentProfile,
                        feedbacks: [data.feedback, ...(selectedStudentProfile.feedbacks || [])]
                    });
                }
            } else {
                alert(data.message || "Failed to add feedback.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Load student portfolio detail
    const loadStudentProfileDetail = async (username) => {
        try {
            // Since we don't have DRF, we can load student details from our serialize endpoint or initial data.
            // But wait! We can just fetch the student's portfolio data or we can pass a simple JSON endpoint.
            // Let's check: we can fetch their data by building a simple custom JSON view in dashboard.
            // Wait, we didn't define a JSON portfolio view. But we have a public portfolio page!
            // Actually, we can fetch all student details directly. To make it extremely simple, we can write a tiny JSON endpoint in dashboard or reuse student profiles.
            // Let's see: we can mock load it from our local student list, or fetch.
            // Wait, let's write a quick fetch, or we can just fetch from the public portfolio page and parse it, or we can write a simple endpoint.
            // Since we want to make it extremely clean, let's mock load some info or we can create a view to get student detail!
            // Wait! In `dashboard/views.py`, we can easily add a view or retrieve their skills/projects.
            // Let's look at what data is already in the student list in `initialData.students`:
            // It has: full_name, email, department, college, career_score, profile_strength.
            // If we want to show their skills and projects, we can easily serialize them!
            // Let's create an endpoint `/api/faculty/student-detail/<id>/` in Django or fetch.
            // Actually, to make it extremely complete, let's look: we can fetch from the portfolio link or write a simple endpoint in Django!
            // Let's see if we should write a simple endpoint `faculty_student_detail` in `dashboard/views.py`!
            // Wait, yes, that is extremely useful! Let's check if we can add it in `dashboard/views.py`.
            // But we already compiled `views.py`! We can add a simple function or fetch the public portfolio details in JSON format.
            // Let's see: we can write a view in Django and add it to urls.py!
            // Wait, why not just query it in Python?
            // Let's add the view `/api/faculty/student-detail/<int:student_id>/` in `dashboard/views.py`!
            // Let's check if we can edit `dashboard/views.py` to add `faculty_student_detail`!
            // Let's view the end of `dashboard/views.py` again. It ends with `public_portfolio`. We can append `faculty_student_detail` right before it!
            // Let's write the view:
            // ```python
            // @login_required
            // def faculty_student_detail(request, student_id):
            //     if request.user.role != User.Role.FACULTY:
            //         return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)
            //     student = get_object_or_404(StudentProfile, id=student_id)
            //     return JsonResponse({
            //         "status": "success",
            //         "skills": [serialize_student_skill(s) for s in student.skills.all()],
            //         "projects": [serialize_project(p) for p in student.projects.all()],
            //         "certificates": [serialize_certificate(c) for c in student.certificates.all()],
            //         "internships": [serialize_internship(i) for i in student.internships.all()],
            //         "achievements": [serialize_achievement(a) for a in student.achievements.all()],
            //         "feedbacks": [serialize_feedback(f) for f in student.feedbacks.all().order_by("-created_at")]
            //     })
            // ```
            // This is perfect! Let's add it to `dashboard/views.py` and `dashboard/urls.py` in the next step, but let's write `FacultyDashboard.jsx` to fetch from this endpoint!
            
            const res = await fetch(`/api/faculty/student-detail/${selectedStudent.id}/`);
            if (res.ok) {
                const data = await res.json();
                setSelectedStudentProfile(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setSelectedStudentProfile(null);
        // We'll call loadStudentProfileDetail in a useEffect or right here
        setTimeout(() => {
            // Fetch student profile details
            fetchStudentDetails(student.id);
        }, 100);
    };

    const fetchStudentDetails = async (id) => {
        try {
            const res = await fetch(`/api/faculty/student-detail/${id}/`);
            if (res.ok) {
                const data = await res.json();
                setSelectedStudentProfile(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredStudents = students.filter(s =>
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-mark">S</div>
                    <div>
                        <h2>SkillForge</h2>
                        <span>Faculty Supervisor</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="nav-title">MAIN</span>
                        <button onClick={() => setActiveTab("overview")} className={`nav-item ${activeTab === "overview" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>▦</span> Overview
                        </button>
                        <button onClick={() => setActiveTab("verifications")} className={`nav-item ${activeTab === "verifications" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>🔐</span> Verifications ({getPendingCount()})
                        </button>
                        <button onClick={() => setActiveTab("students")} className={`nav-item ${activeTab === "students" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>👨‍🎓</span> Students Catalog
                        </button>
                    </div>
                </nav>

                <div className="sidebar-bottom">
                    <a href="/accounts/logout/" className="nav-item logout">
                        <span>↪</span> Logout
                    </a>
                </div>
            </aside>

            {/* Main Area */}
            <main className="dashboard-main">
                {/* Topbar */}
                <header className="topbar">
                    <div>
                        <h1>Faculty Panel</h1>
                        <p>Welcome, <strong>{initialData.user?.username}</strong> 👋</p>
                    </div>

                    <div className="topbar-right">
                        <div className="user-menu">
                            <div className="user-avatar" style={{ backgroundColor: "#10b981" }}>
                                {initialData.user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <strong>{initialData.user?.username}</strong>
                                <span>Faculty</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    {/* TAB: OVERVIEW */}
                    {activeTab === "overview" && (
                        <div>
                            <div className="welcome-section">
                                <div>
                                    <h2>Supervisor Dashboard</h2>
                                    <p>Monitor student progress and verify portfolios.</p>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ color: "var(--primary-color)" }}>👨‍🎓</div>
                                    <div className="stat-content">
                                        <span>Supervised Students</span>
                                        <strong>{students.length}</strong>
                                        <small>active profiles</small>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon" style={{ color: "var(--warning-color)" }}>⏳</div>
                                    <div className="stat-content">
                                        <span>Pending Verifications</span>
                                        <strong style={{ color: "var(--warning-color)" }}>{getPendingCount()}</strong>
                                        <small>requires review</small>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-card" style={{ marginTop: "30px" }}>
                                <div className="card-header">
                                    <h2>Top Developing Students</h2>
                                    <span>Highest Career Scores</span>
                                </div>
                                <div className="activity-list">
                                    {students.slice().sort((a,b) => b.career_score.total - a.career_score.total).slice(0, 5).map((s, idx) => (
                                        <div key={s.id} className="opportunity" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                <div style={{ width: "35px", height: "35px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <strong style={{ color: "#fff" }}>{s.full_name}</strong>
                                                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{s.department || "General"}</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <strong style={{ color: "var(--success-color)", fontSize: "16px" }}>{s.career_score.total}</strong>
                                                <span style={{ display: "block", fontSize: "9px", color: "var(--text-muted)" }}>CAREER SCORE</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: VERIFICATIONS */}
                    {activeTab === "verifications" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ marginBottom: "25px" }}>
                                <h2>Pending Approvals</h2>
                                <p>Verify student skills, projects, and certificates to authenticate their portfolios.</p>
                            </div>

                            {/* Skills Verification List */}
                            {getPendingCount() === 0 ? (
                                <p style={{ color: "var(--text-secondary)" }}>No pending verifications at this time.</p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    
                                    {/* Skills */}
                                    {pendingVerifications.skills.map(s => (
                                        <div key={s.id} className="project-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div>
                                                    <strong style={{ fontSize: "17px", color: "#fff" }}>Skill: {s.name}</strong>
                                                    <p style={{ fontSize: "13px", color: "#818cf8", fontWeight: "600", marginTop: "2px" }}>Student: {s.student_name} ({s.student_username})</p>
                                                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                                                        Category: {s.category} | Level: {s.level} | Experience: {s.years_experience} years
                                                    </p>
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <button onClick={() => setVerifyingItem({ id: s.id, type: "skill", action: "approve", name: s.name, student: s.student_name })} className="verified-badge" style={{ border: "none", cursor: "pointer" }}>✓ Approve</button>
                                                    <button onClick={() => setVerifyingItem({ id: s.id, type: "skill", action: "reject", name: s.name, student: s.student_name })} className="pending-badge" style={{ border: "none", cursor: "pointer", color: "var(--danger-color)", background: "rgba(239,68,68,0.1)" }}>✕ Reject</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Projects */}
                                    {pendingVerifications.projects.map(p => (
                                        <div key={p.id} className="project-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div style={{ flex: 1 }}>
                                                    <strong style={{ fontSize: "17px", color: "#fff" }}>Project: {p.name}</strong>
                                                    <p style={{ fontSize: "13px", color: "#818cf8", fontWeight: "600", marginTop: "2px" }}>Student: {p.student_name}</p>
                                                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>{p.description}</p>
                                                    <div className="project-tags" style={{ marginTop: "10px" }}>
                                                        {p.technologies.split(",").map((tech, idx) => (
                                                            <span key={idx} className="tech-tag">{tech.trim()}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <button onClick={() => setVerifyingItem({ id: p.id, type: "project", action: "approve", name: p.name, student: p.student_name })} className="verified-badge" style={{ border: "none", cursor: "pointer" }}>✓ Approve</button>
                                                    <button onClick={() => setVerifyingItem({ id: p.id, type: "project", action: "reject", name: p.name, student: p.student_name })} className="pending-badge" style={{ border: "none", cursor: "pointer", color: "var(--danger-color)", background: "rgba(239,68,68,0.1)" }}>✕ Reject</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Certificates */}
                                    {pendingVerifications.certificates.map(c => (
                                        <div key={c.id} className="project-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div>
                                                    <strong style={{ fontSize: "17px", color: "#fff" }}>Certificate: {c.name}</strong>
                                                    <p style={{ fontSize: "13px", color: "#818cf8", fontWeight: "600", marginTop: "2px" }}>Student: {c.student_name}</p>
                                                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                                                        Issuer: {c.issuing_organization} | Issued: {new Date(c.issue_date).toLocaleDateString()}
                                                    </p>
                                                    {c.credential_url && <a href={c.credential_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--primary-color)", marginTop: "5px", display: "inline-block" }}>View Certificate Link</a>}
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <button onClick={() => setVerifyingItem({ id: c.id, type: "certificate", action: "approve", name: c.name, student: c.student_name })} className="verified-badge" style={{ border: "none", cursor: "pointer" }}>✓ Approve</button>
                                                    <button onClick={() => setVerifyingItem({ id: c.id, type: "certificate", action: "reject", name: c.name, student: c.student_name })} className="pending-badge" style={{ border: "none", cursor: "pointer", color: "var(--danger-color)", background: "rgba(239,68,68,0.1)" }}>✕ Reject</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Internships */}
                                    {pendingVerifications.internships.map(i => (
                                        <div key={i.id} className="project-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div>
                                                    <strong style={{ fontSize: "17px", color: "#fff" }}>Internship: {i.role} at {i.company_name}</strong>
                                                    <p style={{ fontSize: "13px", color: "#818cf8", fontWeight: "600", marginTop: "2px" }}>Student: {i.student_name}</p>
                                                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>{i.description}</p>
                                                </div>
                                                <div style={{ display: "flex", gap: "10px" }}>
                                                    <button onClick={() => setVerifyingItem({ id: i.id, type: "internship", action: "approve", name: i.role, student: i.student_name })} className="verified-badge" style={{ border: "none", cursor: "pointer" }}>✓ Approve</button>
                                                    <button onClick={() => setVerifyingItem({ id: i.id, type: "internship", action: "reject", name: i.role, student: i.student_name })} className="pending-badge" style={{ border: "none", cursor: "pointer", color: "var(--danger-color)", background: "rgba(239,68,68,0.1)" }}>✕ Reject</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: STUDENTS CATALOG */}
                    {activeTab === "students" && (
                        <div style={{ display: "grid", gridTemplateColumns: selectedStudent ? "1fr 1fr" : "1fr", gap: "30px" }}>
                            
                            {/* Students List */}
                            <div className="dashboard-card">
                                <div className="card-header" style={{ marginBottom: "20px" }}>
                                    <h2>Supervised Students</h2>
                                    <input
                                        type="text"
                                        placeholder="Search by name or department..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            width: "100%",
                                            marginTop: "15px",
                                            background: "rgba(11,15,25,0.8)",
                                            border: "1px solid var(--surface-border)",
                                            borderRadius: "8px",
                                            color: "#fff",
                                            padding: "10px 15px",
                                            fontSize: "14px"
                                        }}
                                    />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                    {filteredStudents.length === 0 ? (
                                        <p style={{ color: "var(--text-secondary)" }}>No students found.</p>
                                    ) : (
                                        filteredStudents.map(s => (
                                            <div
                                                key={s.id}
                                                onClick={() => handleSelectStudent(s)}
                                                style={{
                                                    background: selectedStudent?.id === s.id ? "rgba(79, 70, 229, 0.08)" : "rgba(255,255,255,0.02)",
                                                    border: selectedStudent?.id === s.id ? "1px solid var(--primary-color)" : "1px solid var(--surface-border)",
                                                    padding: "15px 20px",
                                                    borderRadius: "10px",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    transition: "all 0.3s"
                                                }}
                                            >
                                                <div>
                                                    <strong style={{ color: "#fff", fontSize: "15px" }}>{s.full_name}</strong>
                                                    <span style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                                                        {s.department} • CS Score: {s.career_score.total}
                                                    </span>
                                                </div>
                                                <span style={{ color: "var(--primary-color)", fontSize: "18px" }}>➔</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Student Detail Panel */}
                            {selectedStudent && (
                                <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--surface-border)", paddingBottom: "15px" }}>
                                        <div>
                                            <h2 style={{ fontSize: "20px" }}>{selectedStudent.full_name}</h2>
                                            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{selectedStudent.college} • {selectedStudent.department}</p>
                                        </div>
                                        <button onClick={() => setSelectedStudent(null)} style={{ background: "none", border: "none", color: "#fff", fontSize: "16px", cursor: "pointer" }}>✕ Close</button>
                                    </div>

                                    {!selectedStudentProfile ? (
                                        <p style={{ color: "var(--text-secondary)" }}>Loading student details...</p>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxHeight: "500px", overflowY: "auto", paddingRight: "10px" }}>
                                            
                                            {/* Mentoring comment form */}
                                            <form onSubmit={handleAddFeedback} style={{ display: "flex", flexDirection: "column", gap: "10px", borderBottom: "1px solid var(--surface-border)", paddingBottom: "20px" }}>
                                                <label style={{ fontSize: "13px", color: "#fff", fontWeight: "600" }}>Write Mentor Guidance Comment</label>
                                                <textarea
                                                    value={feedbackText}
                                                    onChange={(e) => setFeedbackText(e.target.value)}
                                                    placeholder="Add direct guidance or feedback to student profile..."
                                                    rows="2"
                                                    required
                                                    style={{ background: "rgba(11,15,25,0.8)", border: "1px solid var(--surface-border)", borderRadius: "8px", color: "#fff", padding: "10px", fontFamily: "inherit", fontSize: "13px" }}
                                                />
                                                <button type="submit" className="portfolio-button" style={{ alignSelf: "flex-end", padding: "6px 15px", fontSize: "12px" }}>Send Comment</button>
                                            </form>

                                            {/* Profile Stats */}
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--surface-border)", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                                                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>CAREER SCORE</span>
                                                    <strong style={{ display: "block", fontSize: "28px", color: "var(--success-color)", fontFamily: "var(--font-display)" }}>{selectedStudent.career_score.total}</strong>
                                                </div>
                                                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--surface-border)", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                                                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>PROFILE STRENGTH</span>
                                                    <strong style={{ display: "block", fontSize: "28px", color: "var(--primary-color)", fontFamily: "var(--font-display)" }}>{selectedStudent.profile_strength.score}%</strong>
                                                </div>
                                            </div>

                                            {/* Verified Skills */}
                                            <div>
                                                <h4 style={{ fontSize: "13px", color: "#fff", marginBottom: "10px" }}>Verified Skills</h4>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                    {selectedStudentProfile.skills?.filter(s => s.verification_status === "approved").map(s => (
                                                        <span key={s.id} className="tech-tag" style={{ border: "1px solid rgba(16,185,129,0.3)", color: "var(--success-color)", background: "transparent" }}>
                                                            {s.name} ({s.level_display})
                                                        </span>
                                                    ))}
                                                    {selectedStudentProfile.skills?.filter(s => s.verification_status === "approved").length === 0 && (
                                                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>No verified skills.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Verified Projects */}
                                            <div>
                                                <h4 style={{ fontSize: "13px", color: "#fff", marginBottom: "10px" }}>Verified Projects</h4>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                    {selectedStudentProfile.projects?.filter(p => p.verification_status === "approved").map(p => (
                                                        <div key={p.id} style={{ padding: "10px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--surface-border)", borderRadius: "6px" }}>
                                                            <strong style={{ color: "#fff", fontSize: "13px" }}>{p.name}</strong>
                                                            <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{p.description}</p>
                                                            <small style={{ color: "#818cf8", fontSize: "10px" }}>Tags: {p.technologies}</small>
                                                        </div>
                                                    ))}
                                                    {selectedStudentProfile.projects?.filter(p => p.verification_status === "approved").length === 0 && (
                                                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>No verified projects.</p>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </main>

            {/* VERIFICATION MODAL POPUP */}
            {verifyingItem && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(11, 15, 25, 0.85)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10000
                }}>
                    <div className="auth-card" style={{ width: "100%", maxWidth: "450px", background: "var(--surface-color)", border: "1px solid var(--surface-border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--surface-border)", paddingBottom: "15px" }}>
                            <h3 style={{ fontSize: "18px", color: "#fff" }}>
                                Review Verification
                            </h3>
                            <button onClick={() => setVerifyingItem(null)} style={{ background: "none", border: "none", color: "#fff", fontSize: "18px", cursor: "pointer" }}>✕</button>
                        </div>

                        <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                            You are reviewing <strong>{verifyingItem.name}</strong> submitted by student <strong>{verifyingItem.student}</strong>.
                            Action: <strong style={{ color: verifyingItem.action === "approve" ? "var(--success-color)" : "var(--danger-color)" }}>{verifyingItem.action === "approve" ? "Approve" : "Reject"}</strong>
                        </div>

                        <form onSubmit={handleVerifySubmit} className="auth-form">
                            <div className="form-group">
                                <label>Verification Comment / Feedback (Optional)</label>
                                <textarea
                                    value={actionFeedback}
                                    onChange={(e) => setActionFeedback(e.target.value)}
                                    placeholder="Enter feedback for the student..."
                                    rows="3"
                                    style={{ background: "rgba(11,15,25,0.8)", border: "1px solid var(--surface-border)", borderRadius: "8px", color: "#fff", padding: "10px", fontFamily: "inherit" }}
                                />
                            </div>
                            <button type="submit" className="btn-auth" style={{ backgroundColor: verifyingItem.action === "approve" ? "var(--success-color)" : "var(--danger-color)" }}>
                                Confirm {verifyingItem.action === "approve" ? "Approval" : "Rejection"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FacultyDashboard;