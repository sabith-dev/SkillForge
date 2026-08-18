import React, { useState } from "react";
import Topbar from "../components/Topbar.jsx";

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

function StudentDashboard({ initialData }) {
    // Core States
    const [profile, setProfile] = useState(initialData.profile || {});
    const [profileStrength, setProfileStrength] = useState(initialData.profile_strength || { score: 0, details: [] });
    const [careerScore, setCareerScore] = useState(initialData.career_score || { total: 0 });
    const [skills, setSkills] = useState(initialData.skills || []);
    const [projects, setProjects] = useState(initialData.projects || []);
    const [certificates, setCertificates] = useState(initialData.certificates || []);
    const [internships, setInternships] = useState(initialData.internships || []);
    const [achievements, setAchievements] = useState(initialData.achievements || []);
    const [seminars, setSeminars] = useState(initialData.seminars || []);
    const [researchPapers, setResearchPapers] = useState(initialData.research_papers || []);
    const [opportunities, setOpportunities] = useState(initialData.opportunities || []);
    const [feedbacks, setFeedbacks] = useState(initialData.feedbacks || []);
    const [notifications, setNotifications] = useState(initialData.notifications || []);
    
    // Navigation & UI States
    const [activeTab, setActiveTab] = useState("overview");
    const [showModal, setShowModal] = useState(null); // 'skill', 'project', 'cert', 'internship', 'achievement', 'research', 'seminar'
    const [modalError, setModalError] = useState("");
    const [roadmapRole, setRoadmapRole] = useState("frontend");
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

    const getUnreadNotificationsCount = () => {
        return notifications.filter(n => !n.is_read).length;
    };

    // Actions
    const handleMarkNotificationsRead = async () => {
        try {
            const res = await fetch("/api/notifications/read-all/", {
                method: "POST",
                headers: { "X-CSRFToken": getCookie("csrftoken") }
            });
            if (res.ok) {
                setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleApplyOpportunity = async (oppId) => {
        try {
            const res = await fetch("/api/student/opportunities/apply/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify({ opportunity_id: oppId })
            });
            const data = await res.json();
            if (res.ok) {
                // Update opportunity status
                setOpportunities(opportunities.map(o => o.id === oppId ? { ...o, applied: true } : o));
                // Add a notification locally
                const newNotification = {
                    id: Date.now(),
                    text: `Successfully applied to opportunity.`,
                    is_read: false,
                    created_at: new Date().toISOString()
                };
                setNotifications([newNotification, ...notifications]);
            } else {
                alert(data.message || "Failed to apply.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const res = await fetch("/api/student/profile/update/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                setProfile(result.profile);
                setProfileStrength(result.profile_strength);
                alert("Profile updated successfully!");
            } else {
                alert(result.message || "Failed to update profile.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Generic Add Submission
    const handleAddSubmit = async (e, url, stateUpdater, modalName) => {
        e.preventDefault();
        setModalError("");
        const formData = new FormData(e.target);
        const bodyData = Object.fromEntries(formData.entries());
        
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify(bodyData)
            });
            const result = await res.json();
            if (res.ok) {
                if (modalName === "skill") {
                    stateUpdater([result.skill, ...skills]);
                } else if (modalName === "project") {
                    stateUpdater([result.project, ...projects]);
                } else if (modalName === "cert") {
                    stateUpdater([result.certificate, ...certificates]);
                } else if (modalName === "internship") {
                    stateUpdater([result.internship, ...internships]);
                } else if (modalName === "achievement") {
                    stateUpdater([result.achievement, ...achievements]);
                } else if (modalName === "research") {
                    if (result.type === "seminar") {
                        setSeminars([result.item, ...seminars]);
                    } else {
                        setResearchPapers([result.item, ...researchPapers]);
                    }
                }
                
                if (result.career_score) {
                    setCareerScore(result.career_score);
                }
                setShowModal(null);
            } else {
                setModalError(result.message || "Submission failed.");
            }
        } catch (err) {
            setModalError("Network error. Please try again.");
        }
    };

    // Generic Delete
    const handleDelete = async (id, url, stateUpdater, currentState, type = null) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        
        try {
            const body = { id };
            if (type) body.type = type;
            
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify(body)
            });
            const result = await res.json();
            if (res.ok) {
                if (type === "seminar") {
                    setSeminars(seminars.filter(s => s.id !== id));
                } else if (type === "research_paper") {
                    setResearchPapers(researchPapers.filter(r => r.id !== id));
                } else {
                    stateUpdater(currentState.filter(item => item.id !== id));
                }
                if (result.career_score) {
                    setCareerScore(result.career_score);
                }
            } else {
                alert(result.message || "Failed to delete.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Roadmap definitions
    const roadmaps = {
        frontend: {
            title: "Frontend Developer",
            skills: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Next.js", "UI/UX Design"]
        },
        backend: {
            title: "Backend Developer",
            skills: ["Python", "Django", "Node.js", "Express", "PostgreSQL", "MySQL", "Docker", "Git"]
        },
        data_science: {
            title: "Data Scientist",
            skills: ["Python", "MySQL", "PostgreSQL", "Git"]
        },
        ui_ux: {
            title: "UI/UX Designer",
            skills: ["UI/UX Design", "Figma", "HTML", "CSS"]
        },
        fullstack: {
            title: "Full Stack Developer",
            skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Django", "PostgreSQL", "Git", "Docker"]
        }
    };

    const getRoadmapProgress = (roleKey) => {
        const req = roadmaps[roleKey].skills;
        const verifiedList = skills.filter(s => s.verification_status === "approved").map(s => s.name.toLowerCase());
        const matched = req.filter(s => verifiedList.includes(s.toLowerCase()));
        return {
            total: req.length,
            completed: matched.length,
            percentage: Math.round((matched.length / req.length) * 100) || 0
        };
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-mark">S</div>
                    <div>
                        <h2>SkillForge</h2>
                        <span>Career Identity</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="nav-title">MAIN</span>
                        <button onClick={() => setActiveTab("overview")} className={`nav-item ${activeTab === "overview" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>▦</span> Dashboard
                        </button>
                        <button onClick={() => setActiveTab("profile")} className={`nav-item ${activeTab === "profile" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>👤</span> My Profile
                        </button>
                        <button onClick={() => setActiveTab("skills")} className={`nav-item ${activeTab === "skills" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>⚡</span> My Skills
                        </button>
                        <button onClick={() => setActiveTab("projects")} className={`nav-item ${activeTab === "projects" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>▣</span> Projects
                        </button>
                    </div>

                    <div className="nav-section">
                        <span className="nav-title">CAREER</span>
                        <button onClick={() => setActiveTab("certificates")} className={`nav-item ${activeTab === "certificates" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>📜</span> Certificates
                        </button>
                        <button onClick={() => setActiveTab("internships")} className={`nav-item ${activeTab === "internships" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>💼</span> Internships
                        </button>
                        <button onClick={() => setActiveTab("achievements")} className={`nav-item ${activeTab === "achievements" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>🏆</span> Achievements
                        </button>
                        <button onClick={() => setActiveTab("research")} className={`nav-item ${activeTab === "research" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>🔬</span> Research & Papers
                        </button>
                        <button onClick={() => setActiveTab("opportunities")} className={`nav-item ${activeTab === "opportunities" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>🎯</span> Opportunities
                        </button>
                        <button onClick={() => setActiveTab("roadmap")} className={`nav-item ${activeTab === "roadmap" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>🧭</span> Career Roadmap
                        </button>
                    </div>

                    <div className="nav-section">
                        <span className="nav-title">PORTFOLIO</span>
                        <a href={`/portfolio/${initialData.user?.username}/`} target="_blank" rel="noopener noreferrer" className="nav-item">
                            <span>🌐</span> View Public Portfolio
                        </a>
                    </div>
                </nav>

                <div className="sidebar-bottom">
                    <a href="/accounts/logout/" className="nav-item logout">
                        <span>↪</span> Logout
                    </a>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="dashboard-main">
                {/* Topbar */}
                <header className="topbar">
                    <div>
                        <h1>Student Panel</h1>
                        <p>Welcome back, <strong>{initialData.user?.username}</strong> 👋</p>
                    </div>

                    <div className="topbar-right">
                        {/* Notifications */}
                        <div style={{ position: "relative" }}>
                            <button className="notification-btn" onClick={() => {
                                setShowNotificationDropdown(!showNotificationDropdown);
                                if (!showNotificationDropdown) {
                                    handleMarkNotificationsRead();
                                }
                            }}>
                                🔔
                                {getUnreadNotificationsCount() > 0 && (
                                    <span className="notification-dot">
                                        {getUnreadNotificationsCount()}
                                    </span>
                                )}
                            </button>

                            {showNotificationDropdown && (
                                <div style={{
                                    position: "absolute",
                                    top: "50px",
                                    right: 0,
                                    width: "320px",
                                    background: "var(--surface-color)",
                                    border: "1px solid var(--surface-border)",
                                    borderRadius: "12px",
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                                    zIndex: 100,
                                    maxHeight: "360px",
                                    overflowY: "auto",
                                    padding: "15px"
                                }}>
                                    <h3 style={{ fontSize: "14px", color: "#fff", marginBottom: "10px" }}>Notifications</h3>
                                    {notifications.length === 0 ? (
                                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>No notifications yet.</p>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {notifications.map(n => (
                                                <div key={n.id} style={{
                                                    fontSize: "12px",
                                                    padding: "8px",
                                                    borderRadius: "6px",
                                                    background: n.is_read ? "transparent" : "rgba(79, 70, 229, 0.1)",
                                                    borderBottom: "1px solid var(--surface-border)"
                                                }}>
                                                    <p style={{ color: "#fff" }}>{n.text}</p>
                                                    <small style={{ color: "var(--text-muted)", fontSize: "9px" }}>
                                                        {new Date(n.created_at).toLocaleDateString()}
                                                    </small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="user-menu">
                            <div className="user-avatar">
                                {initialData.user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <strong>{initialData.user?.username}</strong>
                                <span>Student</span>
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
                                    <h2>Living Career Overview</h2>
                                    <p>Your real-time profile analytics and score indicators.</p>
                                </div>
                                <a href={`/portfolio/${initialData.user?.username}/`} target="_blank" rel="noopener noreferrer" className="portfolio-button">
                                    🌐 Share Portfolio
                                </a>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ color: "var(--primary-color)" }}>⚡</div>
                                    <div className="stat-content">
                                        <span>Skills Added</span>
                                        <strong>{skills.length}</strong>
                                        <small>{skills.filter(s => s.verification_status === "approved").length} verified</small>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon" style={{ color: "var(--success-color)" }}>▣</div>
                                    <div className="stat-content">
                                        <span>Projects Done</span>
                                        <strong>{projects.length}</strong>
                                        <small>{projects.filter(p => p.verification_status === "approved").length} verified</small>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon" style={{ color: "var(--warning-color)" }}>📜</div>
                                    <div className="stat-content">
                                        <span>Certificates</span>
                                        <strong>{certificates.length}</strong>
                                        <small>{certificates.filter(c => c.verification_status === "approved").length} verified</small>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon" style={{ color: "var(--danger-color)" }}>💼</div>
                                    <div className="stat-content">
                                        <span>Internships</span>
                                        <strong>{internships.length}</strong>
                                        <small>{internships.filter(i => i.verification_status === "approved").length} verified</small>
                                    </div>
                                </div>
                            </div>

                            <div className="score-grid">
                                {/* Career Score card */}
                                <div className="dashboard-card">
                                    <div className="card-header">
                                        <div>
                                            <h2>Career Score</h2>
                                            <p>Measured from verified credentials.</p>
                                        </div>
                                        <span className="score-badge">Ready</span>
                                    </div>
                                    
                                    <div className="score-display">
                                        <div className="score-circle">
                                            <strong>{careerScore.total}</strong>
                                            <span>/100</span>
                                        </div>
                                        <div className="score-details">
                                            <div>
                                                <span>Skills</span>
                                                <strong>{careerScore.skills?.score}/{careerScore.skills?.max}</strong>
                                            </div>
                                            <div>
                                                <span>Projects</span>
                                                <strong>{careerScore.projects?.score}/{careerScore.projects?.max}</strong>
                                            </div>
                                            <div>
                                                <span>Certificates</span>
                                                <strong>{careerScore.certificates?.score}/{careerScore.certificates?.max}</strong>
                                            </div>
                                            <div>
                                                <span>Internships</span>
                                                <strong>{careerScore.internships?.score}/{careerScore.internships?.max}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Strength card */}
                                <div className="dashboard-card">
                                    <div className="card-header">
                                        <div>
                                            <h2>Profile Strength</h2>
                                            <p>Add profile details to stand out.</p>
                                        </div>
                                        <span className="percentage">{profileStrength.score}%</span>
                                    </div>
                                    <div className="progress-container">
                                        <div className="progress-bar" style={{ width: `${profileStrength.score}%` }}></div>
                                    </div>
                                    <div className="profile-checklist">
                                        {profileStrength.details?.map((d, index) => (
                                            <div key={index} className={d.completed ? "completed" : "pending"}>
                                                {d.completed ? "✓" : "+"} {d.name} ({d.points}%)
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bottom-grid">
                                {/* Feedback list */}
                                <div className="dashboard-card">
                                    <div className="card-header">
                                        <h2>Mentoring Feedback</h2>
                                        <span>Faculty Guidance</span>
                                    </div>
                                    <div className="activity-list" style={{ maxHeight: "250px", overflowY: "auto" }}>
                                        {feedbacks.length === 0 ? (
                                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "20px" }}>No mentoring comments yet.</p>
                                        ) : (
                                            feedbacks.map(f => (
                                                <div key={f.id} className="activity">
                                                    <div className="activity-icon">✍</div>
                                                    <div>
                                                        <strong>{f.faculty_name}</strong>
                                                        <span>{f.feedback_text}</span>
                                                        <small>{new Date(f.created_at).toLocaleDateString()}</small>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Matching Opportunities Summary */}
                                <div className="dashboard-card">
                                    <div className="card-header">
                                        <h2>Recommended Jobs</h2>
                                        <button onClick={() => setActiveTab("opportunities")} style={{ background: "none", border: "none", color: "var(--primary-color)", fontSize: "12px", cursor: "pointer" }}>View All</button>
                                    </div>
                                    <div className="activity-list">
                                        {opportunities.slice(0, 3).map(o => (
                                            <div key={o.id} className="opportunity">
                                                <div className="company-logo">
                                                    {o.company_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="opportunity-info">
                                                    <strong>{o.job_title}</strong>
                                                    <span>{o.company_name} • {o.location}</span>
                                                    <small>{o.match_score}% Match</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PROFILE */}
                    {activeTab === "profile" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ marginBottom: "20px" }}>
                                <h2>Edit Profile</h2>
                                <p>Update your career objectives, preferences and resume.</p>
                            </div>
                            <form onSubmit={handleProfileUpdate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" name="full_name" defaultValue={profile.full_name || ""} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input type="text" name="phone" defaultValue={profile.phone || ""} />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input type="text" name="location" defaultValue={profile.location || ""} placeholder="e.g. New York, NY" />
                                    </div>
                                    <div className="form-group">
                                        <label>Graduation Year</label>
                                        <input type="number" name="graduation_year" defaultValue={profile.graduation_year || ""} />
                                    </div>
                                    <div className="form-group">
                                        <label>College / Institution</label>
                                        <input type="text" name="college" defaultValue={profile.college || ""} />
                                    </div>
                                    <div className="form-group">
                                        <label>Department / Major</label>
                                        <input type="text" name="department" defaultValue={profile.department || ""} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Bio</label>
                                    <textarea name="bio" defaultValue={profile.bio || ""} rows="3" style={{ background: "rgba(11,15,25,0.8)", border: "1px solid var(--surface-border)", borderRadius: "8px", color: "#fff", padding: "10px", fontFamily: "inherit" }}></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Career Objective</label>
                                    <textarea name="career_objective" defaultValue={profile.career_objective || ""} rows="3" style={{ background: "rgba(11,15,25,0.8)", border: "1px solid var(--surface-border)", borderRadius: "8px", color: "#fff", padding: "10px", fontFamily: "inherit" }}></textarea>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                    <div className="form-group">
                                        <label>Preferred Job Roles (Comma-separated)</label>
                                        <input type="text" name="preferred_job_roles" defaultValue={profile.preferred_job_roles || ""} placeholder="e.g. Frontend Developer, Software Engineer" />
                                    </div>
                                    <div className="form-group">
                                        <label>Preferred Industries (Comma-separated)</label>
                                        <input type="text" name="preferred_industries" defaultValue={profile.preferred_industries || ""} placeholder="e.g. Fintech, Healthcare" />
                                    </div>
                                    <div className="form-group">
                                        <label>Work Preference</label>
                                        <select name="work_preference" defaultValue={profile.work_preference || "Remote"}>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="On-site">On-site</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Experience Level</label>
                                        <select name="experience_level" defaultValue={profile.experience_level || "Junior"}>
                                            <option value="Intern">Intern</option>
                                            <option value="Junior">Entry / Junior</option>
                                            <option value="Mid">Mid-level</option>
                                            <option value="Senior">Senior</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                                    <div className="form-group">
                                        <label>GitHub URL</label>
                                        <input type="url" name="github" defaultValue={profile.github || ""} />
                                    </div>
                                    <div className="form-group">
                                        <label>LinkedIn URL</label>
                                        <input type="url" name="linkedin" defaultValue={profile.linkedin || ""} />
                                    </div>
                                    <div className="form-group">
                                        <label>Portfolio Personal URL</label>
                                        <input type="url" name="portfolio_url" defaultValue={profile.portfolio_url || ""} />
                                    </div>
                                </div>

                                <button type="submit" className="portfolio-button" style={{ width: "200px", alignSelf: "flex-end" }}>
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    )}

                    {/* TAB: SKILLS */}
                    {activeTab === "skills" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <div>
                                    <h2>My Skills</h2>
                                    <p>Log your programming, frontend, and database competencies.</p>
                                </div>
                                <button className="portfolio-button" onClick={() => setShowModal("skill")}>+ Add Skill</button>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                                {skills.length === 0 ? (
                                    <p style={{ color: "var(--text-secondary)" }}>You have not added any skills yet.</p>
                                ) : (
                                    skills.map(s => (
                                        <div key={s.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <strong style={{ color: "#fff", fontSize: "16px" }}>{s.name}</strong>
                                                <span className={s.verification_status === "approved" ? "verified-badge" : "pending-badge"}>
                                                    {s.verification_status === "approved" ? "✓ Verified" : s.verification_status === "rejected" ? "✕ Rejected" : "⏳ Pending"}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                                Category: {s.category_display}
                                            </div>
                                            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                                Level: {s.level_display} ({s.years_experience} years exp)
                                            </div>
                                            {s.faculty_feedback && (
                                                <div style={{ fontSize: "12px", background: "rgba(245,158,11,0.05)", borderLeft: "2px solid var(--warning-color)", padding: "5px 10px", color: "var(--warning-color)" }}>
                                                    <strong>Faculty Feedback:</strong> {s.faculty_feedback}
                                                </div>
                                            )}
                                            <button onClick={() => handleDelete(s.id, "/api/student/skills/delete/", setSkills, skills)} style={{ background: "none", border: "none", color: "var(--danger-color)", fontSize: "12px", cursor: "pointer", alignSelf: "flex-end", marginTop: "10px" }}>
                                                🗑 Remove
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: PROJECTS */}
                    {activeTab === "projects" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <div>
                                    <h2>My Projects</h2>
                                    <p>Log and verify your practical software builds.</p>
                                </div>
                                <button className="portfolio-button" onClick={() => setShowModal("project")}>+ Add Project</button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {projects.length === 0 ? (
                                    <p style={{ color: "var(--text-secondary)" }}>You have not added any projects yet.</p>
                                ) : (
                                    projects.map(p => (
                                        <div key={p.id} className="project-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)" }}>
                                            <div className="project-card-header">
                                                <div>
                                                    <div className="project-title" style={{ fontSize: "18px" }}>{p.name}</div>
                                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                                                        Type: {p.project_type_display} | Role: {p.role || "Developer"}
                                                    </div>
                                                </div>
                                                <span className={p.verification_status === "approved" ? "verified-badge" : "pending-badge"}>
                                                    {p.verification_status === "approved" ? "✓ Verified" : p.verification_status === "rejected" ? "✕ Rejected" : "⏳ Pending"}
                                                </span>
                                            </div>
                                            <p className="project-desc">{p.description}</p>
                                            <div className="project-tags">
                                                {p.technologies.split(",").map((tech, i) => (
                                                    <span key={i} className="tech-tag">{tech.trim()}</span>
                                                ))}
                                            </div>
                                            {p.faculty_feedback && (
                                                <div style={{ fontSize: "12px", background: "rgba(245,158,11,0.05)", borderLeft: "2px solid var(--warning-color)", padding: "5px 10px", color: "var(--warning-color)" }}>
                                                    <strong>Faculty Feedback:</strong> {p.faculty_feedback}
                                                </div>
                                            )}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                                                <div className="project-links">
                                                    {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="project-link">GitHub</a>}
                                                    {p.live_demo_url && <a href={p.live_demo_url} target="_blank" rel="noopener noreferrer" className="project-link">Live Demo</a>}
                                                </div>
                                                <button onClick={() => handleDelete(p.id, "/api/student/projects/delete/", setProjects, projects)} style={{ background: "none", border: "none", color: "var(--danger-color)", fontSize: "12px", cursor: "pointer" }}>
                                                    🗑 Delete Project
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: CERTIFICATES */}
                    {activeTab === "certificates" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <div>
                                    <h2>Certifications</h2>
                                    <p>Link course and industry credentials from Coursera, Udemy, AWS, etc.</p>
                                </div>
                                <button className="portfolio-button" onClick={() => setShowModal("cert")}>+ Add Certificate</button>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                                {certificates.length === 0 ? (
                                    <p style={{ color: "var(--text-secondary)" }}>No certificates added yet.</p>
                                ) : (
                                    certificates.map(c => (
                                        <div key={c.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <strong style={{ color: "#fff", fontSize: "16px" }}>{c.name}</strong>
                                                <span className={c.verification_status === "approved" ? "verified-badge" : "pending-badge"}>
                                                    {c.verification_status === "approved" ? "✓ Verified" : c.verification_status === "rejected" ? "✕ Rejected" : "⏳ Pending"}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                                Issuer: {c.issuing_organization}
                                            </div>
                                            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                                Issued: {new Date(c.issue_date).toLocaleDateString()}
                                            </div>
                                            {c.credential_url && (
                                                <a href={c.credential_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--primary-color)" }}>View Certificate Link</a>
                                            )}
                                            {c.faculty_feedback && (
                                                <div style={{ fontSize: "12px", background: "rgba(245,158,11,0.05)", borderLeft: "2px solid var(--warning-color)", padding: "5px 10px", color: "var(--warning-color)" }}>
                                                    <strong>Faculty Feedback:</strong> {c.faculty_feedback}
                                                </div>
                                            )}
                                            <button onClick={() => handleDelete(c.id, "/api/student/certificates/delete/", setCertificates, certificates)} style={{ background: "none", border: "none", color: "var(--danger-color)", fontSize: "12px", cursor: "pointer", alignSelf: "flex-end", marginTop: "10px" }}>
                                                🗑 Delete
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: INTERNSHIPS */}
                    {activeTab === "internships" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <div>
                                    <h2>Work Experience</h2>
                                    <p>Log and verify your internships or industrial work history.</p>
                                </div>
                                <button className="portfolio-button" onClick={() => setShowModal("internship")}>+ Add Experience</button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {internships.length === 0 ? (
                                    <p style={{ color: "var(--text-secondary)" }}>No work experience added yet.</p>
                                ) : (
                                    internships.map(i => (
                                        <div key={i.id} className="project-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)" }}>
                                            <div className="project-card-header">
                                                <div>
                                                    <div className="project-title" style={{ fontSize: "18px" }}>{i.role}</div>
                                                    <div style={{ fontSize: "13px", color: "#818cf8", fontWeight: "600", marginTop: "2px" }}>{i.company_name}</div>
                                                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                                        {new Date(i.start_date).toLocaleDateString()} - {i.end_date ? new Date(i.end_date).toLocaleDateString() : "Present"}
                                                    </div>
                                                </div>
                                                <span className={i.verification_status === "approved" ? "verified-badge" : "pending-badge"}>
                                                    {i.verification_status === "approved" ? "✓ Verified" : i.verification_status === "rejected" ? "✕ Rejected" : "⏳ Pending"}
                                                </span>
                                            </div>
                                            <p className="project-desc">{i.description}</p>
                                            <div className="project-tags">
                                                {i.skills.split(",").map((s, idx) => (
                                                    <span key={idx} className="tech-tag">{s.trim()}</span>
                                                ))}
                                            </div>
                                            {i.faculty_feedback && (
                                                <div style={{ fontSize: "12px", background: "rgba(245,158,11,0.05)", borderLeft: "2px solid var(--warning-color)", padding: "5px 10px", color: "var(--warning-color)" }}>
                                                    <strong>Faculty Feedback:</strong> {i.faculty_feedback}
                                                </div>
                                            )}
                                            <button onClick={() => handleDelete(i.id, "/api/student/internships/delete/", setInternships, internships)} style={{ background: "none", border: "none", color: "var(--danger-color)", fontSize: "12px", cursor: "pointer", alignSelf: "flex-end", marginTop: "10px" }}>
                                                🗑 Delete Experience
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: ACHIEVEMENTS */}
                    {activeTab === "achievements" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <div>
                                    <h2>Achievements & Hackathons</h2>
                                    <p>Log coding contests, hackathons, sports, and academic prizes.</p>
                                </div>
                                <button className="portfolio-button" onClick={() => setShowModal("achievement")}>+ Add Achievement</button>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                                {achievements.length === 0 ? (
                                    <p style={{ color: "var(--text-secondary)" }}>No achievements added yet.</p>
                                ) : (
                                    achievements.map(a => (
                                        <div key={a.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <strong style={{ color: "#fff", fontSize: "16px" }}>{a.title}</strong>
                                                <span className="tech-tag" style={{ background: "rgba(16, 185, 129, 0.1)", border: "none", color: "var(--success-color)" }}>{a.category_display}</span>
                                            </div>
                                            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                                Issuer: {a.issuer}
                                            </div>
                                            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                                Date: {new Date(a.issue_date).toLocaleDateString()}
                                            </div>
                                            <p className="project-desc" style={{ fontSize: "13px" }}>{a.description}</p>
                                            <button onClick={() => handleDelete(a.id, "/api/student/achievements/delete/", setAchievements, achievements)} style={{ background: "none", border: "none", color: "var(--danger-color)", fontSize: "12px", cursor: "pointer", alignSelf: "flex-end", marginTop: "10px" }}>
                                                🗑 Delete
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: RESEARCH */}
                    {activeTab === "research" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <div>
                                    <h2>Research & Seminar Presentations</h2>
                                    <p>Log international research papers, journals, and local presentations.</p>
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button className="portfolio-button" onClick={() => setShowModal("seminar")}>+ Add Seminar</button>
                                    <button className="portfolio-button" onClick={() => setShowModal("research")}>+ Add Paper</button>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
                                <div>
                                    <h3 style={{ fontSize: "16px", color: "#fff", marginBottom: "15px", borderBottom: "1px solid var(--surface-border)", paddingBottom: "10px" }}>Research Papers</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                        {researchPapers.length === 0 ? (
                                            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No papers published.</p>
                                        ) : (
                                            researchPapers.map(r => (
                                                <div key={r.id} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--surface-border)", padding: "15px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                        <strong style={{ color: "#fff", fontSize: "14px" }}>{r.title}</strong>
                                                        <span className={r.verification_status === "approved" ? "verified-badge" : "pending-badge"} style={{ fontSize: "10px" }}>
                                                            {r.verification_status === "approved" ? "✓ Verified" : "⏳ Pending"}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Authors: {r.authors}</div>
                                                    <div style={{ fontSize: "12px", color: "#818cf8" }}>Publication: {r.publication} ({new Date(r.publication_date).toLocaleDateString()})</div>
                                                    {r.paper_url && <a href={r.paper_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--primary-color)", marginTop: "4px" }}>View Publication</a>}
                                                    <button onClick={() => handleDelete(r.id, "/api/student/research/delete/", null, null, "research_paper")} style={{ background: "none", border: "none", color: "var(--danger-color)", fontSize: "11px", cursor: "pointer", alignSelf: "flex-end", marginTop: "10px" }}>
                                                        🗑 Delete
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: "16px", color: "#fff", marginBottom: "15px", borderBottom: "1px solid var(--surface-border)", paddingBottom: "10px" }}>Seminars Presented</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                        {seminars.length === 0 ? (
                                            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No seminars logged.</p>
                                        ) : (
                                            seminars.map(s => (
                                                <div key={s.id} style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--surface-border)", padding: "15px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                        <strong style={{ color: "#fff", fontSize: "14px" }}>{s.topic}</strong>
                                                        <span className={s.verification_status === "approved" ? "verified-badge" : "pending-badge"} style={{ fontSize: "10px" }}>
                                                            {s.verification_status === "approved" ? "✓ Verified" : "⏳ Pending"}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Institution: {s.institution}</div>
                                                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Date: {new Date(s.date).toLocaleDateString()}</div>
                                                    <button onClick={() => handleDelete(s.id, "/api/student/research/delete/", null, null, "seminar")} style={{ background: "none", border: "none", color: "var(--danger-color)", fontSize: "11px", cursor: "pointer", alignSelf: "flex-end", marginTop: "10px" }}>
                                                        🗑 Delete
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: OPPORTUNITIES */}
                    {activeTab === "opportunities" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ marginBottom: "25px" }}>
                                <h2>Opportunity Matching</h2>
                                <p>Automated match scores for internships and job vacancies based on your verified skills.</p>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                                {opportunities.length === 0 ? (
                                    <p style={{ color: "var(--text-secondary)" }}>No job vacancies posted yet.</p>
                                ) : (
                                    opportunities.map(o => (
                                        <div key={o.id} className="project-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)", display: "grid", gridTemplateColumns: "3fr 1fr", gap: "20px", alignItems: "center" }}>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                    <div className="company-logo" style={{ width: "50px", height: "50px", fontSize: "20px" }}>{o.company_name.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <h3 style={{ color: "#fff", fontSize: "18px" }}>{o.job_title}</h3>
                                                        <p style={{ color: "#818cf8", fontSize: "13px", fontWeight: "600" }}>{o.company_name} • {o.location} • {o.job_type_display}</p>
                                                    </div>
                                                </div>
                                                <p className="project-desc" style={{ marginTop: "15px" }}>{o.description}</p>
                                                
                                                <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <div style={{ fontSize: "12px" }}>
                                                        <strong style={{ color: "#fff" }}>Required Skills: </strong>
                                                        {o.required_skills.split(",").map((s, idx) => {
                                                            const match = o.matched_required?.includes(s.trim().toLowerCase());
                                                            return <span key={idx} className="tech-tag" style={{ border: match ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(239,68,68,0.3)", color: match ? "var(--success-color)" : "var(--danger-color)", background: "transparent" }}>{s.trim()}</span>;
                                                        })}
                                                    </div>
                                                    {o.preferred_skills && (
                                                        <div style={{ fontSize: "12px" }}>
                                                            <strong style={{ color: "#fff" }}>Preferred Skills: </strong>
                                                            {o.preferred_skills.split(",").map((s, idx) => {
                                                                const match = o.matched_preferred?.includes(s.trim().toLowerCase());
                                                                return <span key={idx} className="tech-tag" style={{ border: match ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(239,68,68,0.2)", color: match ? "var(--success-color)" : "var(--text-muted)", background: "transparent" }}>{s.trim()}</span>;
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", borderLeft: "1px solid var(--surface-border)", paddingLeft: "20px" }}>
                                                <div style={{ textAlign: "center" }}>
                                                    <strong style={{ display: "block", fontSize: "36px", color: o.match_score >= 80 ? "var(--success-color)" : o.match_score >= 60 ? "var(--warning-color)" : "var(--text-muted)", fontFamily: "var(--font-display)", fontWeight: "800" }}>{o.match_score}%</strong>
                                                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", letterSpacing: "0.5px" }}>MATCH SCORE</span>
                                                </div>
                                                <button
                                                    onClick={() => handleApplyOpportunity(o.id)}
                                                    disabled={o.applied}
                                                    className="portfolio-button"
                                                    style={{ width: "100%", textAlign: "center", background: o.applied ? "rgba(255,255,255,0.05)" : "var(--primary-color)", color: o.applied ? "var(--text-muted)" : "#fff", border: o.applied ? "1px solid var(--surface-border)" : "none" }}
                                                >
                                                    {o.applied ? "Applied" : "Apply Now"}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: ROADMAP */}
                    {activeTab === "roadmap" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                                <div>
                                    <h2>Career Roadmap Target</h2>
                                    <p>Select a target career role to see required skills progression.</p>
                                </div>
                                <select value={roadmapRole} onChange={(e) => setRoadmapRole(e.target.value)} style={{ padding: "10px 15px", background: "var(--surface-color)", border: "1px solid var(--surface-border)", color: "#fff", borderRadius: "8px" }}>
                                    <option value="frontend">Frontend Developer</option>
                                    <option value="backend">Backend Developer</option>
                                    <option value="data_science">Data Scientist</option>
                                    <option value="ui_ux">UI / UX Designer</option>
                                    <option value="fullstack">Full Stack Developer</option>
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
                                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--surface-border)", padding: "25px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "15px", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                                    <h3 style={{ color: "#fff", fontSize: "20px" }}>{roadmaps[roadmapRole].title}</h3>
                                    <div className="score-circle" style={{ width: "140px", height: "140px", border: "12px solid var(--primary-color)", borderColor: roadmapRole === "ui_ux" ? "var(--warning-color)" : "var(--primary-color)" }}>
                                        <strong style={{ fontSize: "36px" }}>{getRoadmapProgress(roadmapRole).percentage}%</strong>
                                        <span>COMPLETED</span>
                                    </div>
                                    <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                        {getRoadmapProgress(roadmapRole).completed} of {getRoadmapProgress(roadmapRole).total} required stack verified.
                                    </p>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                    {roadmaps[roadmapRole].skills.map((skillName, index) => {
                                        // Check if skill is verified
                                        const stdSkill = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
                                        const verified = stdSkill?.verification_status === "approved";
                                        const pending = stdSkill?.verification_status === "pending";
                                        
                                        return (
                                            <div key={index} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)", padding: "18px 20px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                    <div style={{
                                                        width: "30px",
                                                        height: "30px",
                                                        borderRadius: "50%",
                                                        background: verified ? "rgba(16,185,129,0.1)" : pending ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.05)",
                                                        color: verified ? "var(--success-color)" : pending ? "var(--warning-color)" : "var(--text-muted)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontWeight: "bold",
                                                        fontSize: "14px"
                                                    }}>
                                                        {verified ? "✓" : pending ? "⏳" : index + 1}
                                                    </div>
                                                    <strong style={{ color: "#fff", fontSize: "15px" }}>{skillName}</strong>
                                                </div>

                                                <div>
                                                    {verified ? (
                                                        <span className="verified-badge">✓ Verified Stack</span>
                                                    ) : pending ? (
                                                        <span className="pending-badge">⏳ Under Review</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                // Redirect to Skills Tab to add this skill
                                                                setActiveTab("skills");
                                                                setTimeout(() => setShowModal("skill"), 100);
                                                            }}
                                                            className="btn-nav-outline"
                                                            style={{ padding: "6px 12px", fontSize: "11px" }}
                                                        >
                                                            + Add Skill
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* OVERLAY MODALS */}
            {showModal && (
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
                    <div className="auth-card" style={{ width: "100%", maxWidth: "500px", background: "var(--surface-color)", border: "1px solid var(--surface-border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--surface-border)", paddingBottom: "15px" }}>
                            <h3 style={{ fontSize: "18px", color: "#fff" }}>
                                {showModal === "skill" && "Add Skill"}
                                {showModal === "project" && "Add Project"}
                                {showModal === "cert" && "Add Certificate"}
                                {showModal === "internship" && "Add Internship"}
                                {showModal === "achievement" && "Add Achievement"}
                                {showModal === "seminar" && "Add Seminar Presentation"}
                                {showModal === "research" && "Add Research Paper"}
                            </h3>
                            <button onClick={() => { setShowModal(null); setModalError(""); }} style={{ background: "none", border: "none", color: "#fff", fontSize: "18px", cursor: "pointer" }}>✕</button>
                        </div>

                        {modalError && <div className="error-alert">{modalError}</div>}

                        {/* Modal Forms */}
                        {showModal === "skill" && (
                            <form onSubmit={(e) => handleAddSubmit(e, "/api/student/skills/add/", setSkills, "skill")} className="auth-form">
                                <div className="form-group">
                                    <label>Select Skill</label>
                                    <select name="skill_id" required>
                                        {initialData.all_skills_list?.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Level</label>
                                    <select name="level" required>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Years of Experience</label>
                                    <input type="number" name="years_experience" step="0.5" min="0" required placeholder="e.g. 1.5" />
                                </div>
                                <button type="submit" className="btn-auth">Add Skill</button>
                            </form>
                        )}

                        {showModal === "project" && (
                            <form onSubmit={(e) => handleAddSubmit(e, "/api/student/projects/add/", setProjects, "project")} className="auth-form">
                                <div className="form-group">
                                    <label>Project Name</label>
                                    <input type="text" name="name" required placeholder="e.g. GoBus" />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input type="text" name="description" required placeholder="Short summary of the project" />
                                </div>
                                <div className="form-group">
                                    <label>Technologies (Comma-separated)</label>
                                    <input type="text" name="technologies" required placeholder="React, Django, PostgreSQL" />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div className="form-group">
                                        <label>Project Type</label>
                                        <select name="project_type">
                                            <option value="academic">Academic</option>
                                            <option value="personal">Personal</option>
                                            <option value="team">Team</option>
                                            <option value="hackathon">Hackathon</option>
                                            <option value="freelance">Freelance</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Your Role</label>
                                        <input type="text" name="role" placeholder="e.g. Frontend Developer" />
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input type="date" name="start_date" />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input type="date" name="end_date" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>GitHub Repository URL</label>
                                    <input type="url" name="github_url" placeholder="https://github.com/..." />
                                </div>
                                <div className="form-group">
                                    <label>Live Demo URL</label>
                                    <input type="url" name="live_demo_url" placeholder="https://..." />
                                </div>
                                <div className="form-group">
                                    <label>Team Members (Optional)</label>
                                    <input type="text" name="team_members" placeholder="e.g. Sabith, Hakkeem" />
                                </div>
                                <button type="submit" className="btn-auth">Submit Project</button>
                            </form>
                        )}

                        {showModal === "cert" && (
                            <form onSubmit={(e) => handleAddSubmit(e, "/api/student/certificates/add/", setCertificates, "cert")} className="auth-form">
                                <div className="form-group">
                                    <label>Certificate Name</label>
                                    <input type="text" name="name" required placeholder="e.g. Python Programming" />
                                </div>
                                <div className="form-group">
                                    <label>Issuing Organization</label>
                                    <input type="text" name="issuing_organization" required placeholder="e.g. Coursera" />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div className="form-group">
                                        <label>Issue Date</label>
                                        <input type="date" name="issue_date" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Expiration Date (Optional)</label>
                                        <input type="date" name="expiration_date" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Credential ID</label>
                                    <input type="text" name="credential_id" placeholder="Optional" />
                                </div>
                                <div className="form-group">
                                    <label>Credential Verification URL</label>
                                    <input type="url" name="credential_url" placeholder="Optional" />
                                </div>
                                <button type="submit" className="btn-auth">Add Certificate</button>
                            </form>
                        )}

                        {showModal === "internship" && (
                            <form onSubmit={(e) => handleAddSubmit(e, "/api/student/internships/add/", setInternships, "internship")} className="auth-form">
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input type="text" name="company_name" required placeholder="e.g. ABC Technologies" />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <input type="text" name="role" required placeholder="e.g. Frontend Developer Intern" />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input type="date" name="start_date" required />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date (Optional)</label>
                                        <input type="date" name="end_date" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Skills Used (Comma-separated)</label>
                                    <input type="text" name="skills" required placeholder="React, JavaScript, REST API" />
                                </div>
                                <div className="form-group">
                                    <label>Description / Contributions</label>
                                    <textarea name="description" rows="2" style={{ background: "rgba(11,15,25,0.8)", border: "1px solid var(--surface-border)", borderRadius: "8px", color: "#fff", padding: "10px", fontFamily: "inherit" }}></textarea>
                                </div>
                                <button type="submit" className="btn-auth">Save Experience</button>
                            </form>
                        )}

                        {showModal === "achievement" && (
                            <form onSubmit={(e) => handleAddSubmit(e, "/api/student/achievements/add/", setAchievements, "achievement")} className="auth-form">
                                <div className="form-group">
                                    <label>Achievement Title</label>
                                    <input type="text" name="title" required placeholder="e.g. First Prize in National Hackathon" />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select name="category">
                                        <option value="hackathon">Hackathon</option>
                                        <option value="competition">Competition</option>
                                        <option value="award">Award / Prize</option>
                                        <option value="coding">Coding Contest</option>
                                        <option value="academic">Academic Achievement</option>
                                        <option value="sports">Sports</option>
                                        <option value="leadership">Leadership Activity</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div className="form-group">
                                        <label>Issuer / Body</label>
                                        <input type="text" name="issuer" required placeholder="e.g. ABC College" />
                                    </div>
                                    <div className="form-group">
                                        <label>Date Received</label>
                                        <input type="date" name="issue_date" required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Brief Description</label>
                                    <input type="text" name="description" placeholder="Brief summary of your achievement" />
                                </div>
                                <button type="submit" className="btn-auth">Save Achievement</button>
                            </form>
                        )}

                        {showModal === "seminar" && (
                            <form onSubmit={(e) => handleAddSubmit(e, "/api/student/research/add/", null, "research")} className="auth-form">
                                <input type="hidden" name="type" value="seminar" />
                                <div className="form-group">
                                    <label>Seminar Topic</label>
                                    <input type="text" name="topic" required placeholder="e.g. Artificial Intelligence in Healthcare" />
                                </div>
                                <div className="form-group">
                                    <label>Presented At (Institution / Venue)</label>
                                    <input type="text" name="institution" required placeholder="e.g. ABC College" />
                                </div>
                                <div className="form-group">
                                    <label>Presentation Date</label>
                                    <input type="date" name="date" required />
                                </div>
                                <button type="submit" className="btn-auth">Save Seminar</button>
                            </form>
                        )}

                        {showModal === "research" && (
                            <form onSubmit={(e) => handleAddSubmit(e, "/api/student/research/add/", null, "research")} className="auth-form">
                                <input type="hidden" name="type" value="research_paper" />
                                <div className="form-group">
                                    <label>Paper Title</label>
                                    <input type="text" name="title" required placeholder="e.g. Machine Learning for Predictive Analysis" />
                                </div>
                                <div className="form-group">
                                    <label>Authors</label>
                                    <input type="text" name="authors" required placeholder="e.g. Student Name + Faculty Name" />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div className="form-group">
                                        <label>Journal / Conference</label>
                                        <input type="text" name="publication" required placeholder="e.g. International Conference 2026" />
                                    </div>
                                    <div className="form-group">
                                        <label>Publication Date</label>
                                        <input type="date" name="publication_date" required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Paper Link (URL)</label>
                                    <input type="url" name="paper_url" placeholder="https://..." />
                                </div>
                                <button type="submit" className="btn-auth">Save Paper</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentDashboard;