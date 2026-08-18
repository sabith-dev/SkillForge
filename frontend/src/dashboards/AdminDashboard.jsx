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

function AdminDashboard({ initialData }) {
    const [stats, setStats] = useState(initialData.stats || {
        total_students: 0, total_faculty: 0, total_projects: 0, total_certificates: 0, total_internships: 0, total_verified_skills: 0
    });
    const [studentGrowth, setStudentGrowth] = useState(initialData.student_growth || []);
    const [popularSkills, setPopularSkills] = useState(initialData.popular_skills || []);
    const [users, setUsers] = useState(initialData.users || []);
    const [opportunities, setOpportunities] = useState(initialData.opportunities || []);

    const [activeTab, setActiveTab] = useState("overview");
    const [showModal, setShowModal] = useState(null); // 'faculty', 'opportunity'
    const [modalError, setModalError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Submit actions
    const handleAddSubmit = async (e, url, stateUpdater, currentState, modalName) => {
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
                if (modalName === "faculty") {
                    stateUpdater([result.user, ...currentState]);
                    // Update stats
                    setStats({ ...stats, total_faculty: stats.total_faculty + 1 });
                } else if (modalName === "opportunity") {
                    stateUpdater([result.opportunity, ...currentState]);
                }
                setShowModal(null);
            } else {
                setModalError(result.message || "Failed to create.");
            }
        } catch (err) {
            setModalError("Network error. Please try again.");
        }
    };

    const handleDelete = async (id, url, stateUpdater, currentState, isOpportunity = false) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                stateUpdater(currentState.filter(item => item.id !== id));
                if (!isOpportunity) {
                    // Update stats (faculty/student count)
                    const deletedUser = currentState.find(u => u.id === id);
                    if (deletedUser?.role === "STUDENT") {
                        setStats({ ...stats, total_students: stats.total_students - 1 });
                    } else if (deletedUser?.role === "FACULTY") {
                        setStats({ ...stats, total_faculty: stats.total_faculty - 1 });
                    }
                }
            } else {
                const result = await res.json();
                alert(result.message || "Delete failed.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-mark" style={{ backgroundColor: "#818cf8" }}>S</div>
                    <div>
                        <h2>SkillForge</h2>
                        <span>Admin Console</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="nav-title">CONTROL PANEL</span>
                        <button onClick={() => setActiveTab("overview")} className={`nav-item ${activeTab === "overview" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>▦</span> Analytics Reports
                        </button>
                        <button onClick={() => setActiveTab("users")} className={`nav-item ${activeTab === "users" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>👥</span> User Accounts
                        </button>
                        <button onClick={() => setActiveTab("opportunities")} className={`nav-item ${activeTab === "opportunities" ? "active" : ""}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                            <span>🎯</span> Opportunities Job
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
                        <h1>Administrator Dashboard</h1>
                        <p>Welcome back, <strong>{initialData.user?.username}</strong> (Superuser) 🛡</p>
                    </div>

                    <div className="topbar-right">
                        <div className="user-menu">
                            <div className="user-avatar" style={{ backgroundColor: "#818cf8" }}>
                                {initialData.user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <strong>{initialData.user?.username}</strong>
                                <span>Administrator</span>
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
                                    <h2>SkillForge System Reports</h2>
                                    <p>Overall database stats, growth trends, and popular competencies.</p>
                                </div>
                            </div>

                            {/* Stat Cards */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ color: "var(--primary-color)" }}>👨‍🎓</div>
                                    <div className="stat-content">
                                        <span>Total Students</span>
                                        <strong>{stats.total_students}</strong>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ color: "var(--success-color)" }}>👩‍🏫</div>
                                    <div className="stat-content">
                                        <span>Faculty Supervisors</span>
                                        <strong>{stats.total_faculty}</strong>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ color: "var(--warning-color)" }}>▣</div>
                                    <div className="stat-content">
                                        <span>Projects Logged</span>
                                        <strong>{stats.total_projects}</strong>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{ color: "var(--danger-color)" }}>⚡</div>
                                    <div className="stat-content">
                                        <span>Verified Skills</span>
                                        <strong>{stats.total_verified_skills}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* SVGs Charts Section */}
                            <div className="score-grid" style={{ marginTop: "30px" }}>
                                {/* Student Growth Trend Chart (SVG Line Chart) */}
                                <div className="dashboard-card">
                                    <div className="card-header" style={{ marginBottom: "20px" }}>
                                        <h2>Student Growth Trend</h2>
                                        <span>Last 6 Months</span>
                                    </div>
                                    
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <svg width="100%" height="200" viewBox="0 0 500 200" style={{ overflow: "visible" }}>
                                            {/* Grid Lines */}
                                            <line x1="50" y1="20" x2="450" y2="20" stroke="rgba(255,255,255,0.05)" />
                                            <line x1="50" y1="70" x2="450" y2="70" stroke="rgba(255,255,255,0.05)" />
                                            <line x1="50" y1="120" x2="450" y2="120" stroke="rgba(255,255,255,0.05)" />
                                            <line x1="50" y1="170" x2="450" y2="170" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                                            
                                            {/* Line Chart path */}
                                            <path
                                                d="M 50 170 L 130 150 L 210 130 L 290 100 L 370 80 L 450 50"
                                                fill="none"
                                                stroke="var(--primary-color)"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                            />
                                            
                                            {/* Line Dots */}
                                            <circle cx="50" cy="170" r="5" fill="#818cf8" />
                                            <circle cx="130" cy="150" r="5" fill="#818cf8" />
                                            <circle cx="210" cy="130" r="5" fill="#818cf8" />
                                            <circle cx="290" cy="100" r="5" fill="#818cf8" />
                                            <circle cx="370" cy="80" r="5" fill="#818cf8" />
                                            <circle cx="450" cy="50" r="5" fill="#818cf8" />

                                            {/* Labels */}
                                            <text x="50" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Mar</text>
                                            <text x="130" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Apr</text>
                                            <text x="210" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">May</text>
                                            <text x="290" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Jun</text>
                                            <text x="370" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Jul</text>
                                            <text x="450" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Aug</text>

                                            <text x="35" y="174" fill="var(--text-muted)" fontSize="10" textAnchor="end">2.2k</text>
                                            <text x="35" y="124" fill="var(--text-muted)" fontSize="10" textAnchor="end">2.5k</text>
                                            <text x="35" y="74" fill="var(--text-muted)" fontSize="10" textAnchor="end">2.7k</text>
                                            <text x="35" y="24" fill="var(--text-muted)" fontSize="10" textAnchor="end">3.0k</text>
                                        </svg>
                                    </div>
                                </div>

                                {/* Popular Skills Bar Chart */}
                                <div className="dashboard-card">
                                    <div className="card-header" style={{ marginBottom: "20px" }}>
                                        <h2>Most Popular Skills</h2>
                                        <span>Highest Registrations</span>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                        {popularSkills.map((skill, index) => (
                                            <div key={index} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                                                    <span style={{ color: "#fff", fontWeight: "500" }}>{skill.name}</span>
                                                    <span style={{ color: "var(--text-secondary)" }}>{skill.count} users</span>
                                                </div>
                                                <div style={{ height: "10px", background: "#1f2937", borderRadius: "10px", overflow: "hidden" }}>
                                                    <div style={{
                                                        height: "100%",
                                                        width: `${Math.min((skill.count / 15) * 100, 100)}%`,
                                                        background: "linear-gradient(90deg, #818cf8, var(--primary-color))",
                                                        borderRadius: "10px"
                                                    }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: USERS ACCOUNT */}
                    {activeTab === "users" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <div>
                                    <h2>Users Management</h2>
                                    <p>View register lists, delete users, and add new faculty supervisor accounts.</p>
                                </div>
                                <button className="portfolio-button" onClick={() => setShowModal("faculty")}>+ Add Faculty</button>
                            </div>

                            <input
                                type="text"
                                placeholder="Search users by name, email, or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: "100%",
                                    marginBottom: "20px",
                                    background: "rgba(11,15,25,0.8)",
                                    border: "1px solid var(--surface-border)",
                                    borderRadius: "8px",
                                    color: "#fff",
                                    padding: "10px 15px",
                                    fontSize: "14px"
                                }}
                            />

                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid var(--surface-border)", color: "#fff" }}>
                                            <th style={{ padding: "12px 10px" }}>Username</th>
                                            <th style={{ padding: "12px 10px" }}>Email</th>
                                            <th style={{ padding: "12px 10px" }}>Role</th>
                                            <th style={{ padding: "12px 10px" }}>Status</th>
                                            <th style={{ padding: "12px 10px" }}>Joined Date</th>
                                            <th style={{ padding: "12px 10px", textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                                <td style={{ padding: "12px 10px", color: "#fff", fontWeight: "500" }}>{u.username}</td>
                                                <td style={{ padding: "12px 10px", color: "var(--text-secondary)" }}>{u.email}</td>
                                                <td style={{ padding: "12px 10px" }}>
                                                    <span className="tech-tag" style={{
                                                        background: u.role === "ADMIN" ? "rgba(129,140,248,0.1)" : u.role === "FACULTY" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                                                        color: u.role === "ADMIN" ? "#818cf8" : u.role === "FACULTY" ? "var(--success-color)" : "var(--text-secondary)",
                                                        border: "none"
                                                    }}>{u.role}</span>
                                                </td>
                                                <td style={{ padding: "12px 10px", color: u.is_active ? "var(--success-color)" : "var(--danger-color)" }}>
                                                    {u.is_active ? "Active" : "Disabled"}
                                                </td>
                                                <td style={{ padding: "12px 10px", color: "var(--text-muted)" }}>{new Date(u.date_joined).toLocaleDateString()}</td>
                                                <td style={{ padding: "12px 10px", textAlign: "right" }}>
                                                    {u.id !== initialData.user.id && (
                                                        <button onClick={() => handleDelete(u.id, "/api/admin/user/delete/", setUsers, users, false)} style={{ background: "none", border: "none", color: "var(--danger-color)", cursor: "pointer", fontSize: "13px" }}>
                                                            Delete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: OPPORTUNITIES */}
                    {activeTab === "opportunities" && (
                        <div className="dashboard-card">
                            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <div>
                                    <h2>Opportunities Placement</h2>
                                    <p>Create job vacancies or internship postings matching student skill sets.</p>
                                </div>
                                <button className="portfolio-button" onClick={() => setShowModal("opportunity")}>+ Post Job</button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {opportunities.length === 0 ? (
                                    <p style={{ color: "var(--text-secondary)" }}>No job placements posted yet.</p>
                                ) : (
                                    opportunities.map(o => (
                                        <div key={o.id} className="project-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--surface-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                    <div className="company-logo" style={{ width: "40px", height: "40px" }}>{o.company_name.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <strong style={{ color: "#fff", fontSize: "16px" }}>{o.job_title}</strong>
                                                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{o.company_name} • {o.location} • {o.job_type_display}</p>
                                                    </div>
                                                </div>
                                                <p className="project-desc" style={{ marginTop: "10px", fontSize: "13px" }}>{o.description}</p>
                                                <div className="project-tags" style={{ marginTop: "10px" }}>
                                                    {o.required_skills.split(",").map((s, idx) => (
                                                        <span key={idx} className="tech-tag">{s.trim()}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button onClick={() => handleDelete(o.id, "/api/admin/opportunities/delete/", setOpportunities, opportunities, true)} style={{ background: "none", border: "none", color: "var(--danger-color)", cursor: "pointer", fontSize: "13px" }}>
                                                Remove Post
                                            </button>
                                        </div>
                                    ))
                                )}
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
                    <div className="auth-card" style={{ width: "100%", maxWidth: "450px", background: "var(--surface-color)", border: "1px solid var(--surface-border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--surface-border)", paddingBottom: "15px" }}>
                            <h3 style={{ fontSize: "18px", color: "#fff" }}>
                                {showModal === "faculty" ? "Create Faculty Account" : "Post Opportunity"}
                            </h3>
                            <button onClick={() => { setShowModal(null); setModalError(""); }} style={{ background: "none", border: "none", color: "#fff", fontSize: "18px", cursor: "pointer" }}>✕</button>
                        </div>

                        {modalError && <div className="error-alert">{modalError}</div>}

                        {showModal === "faculty" && (
                            <form onSubmit={(e) => handleAddSubmit(e, "/api/admin/faculty/add/", setUsers, users, "faculty")} className="auth-form">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" name="username" required placeholder="Enter username" />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" required placeholder="Enter email address" />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" name="password" required placeholder="Enter secure password" />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input type="text" name="department" placeholder="e.g. Computer Science" />
                                    </div>
                                    <div className="form-group">
                                        <label>Designation</label>
                                        <input type="text" name="designation" placeholder="e.g. Assistant Professor" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Employee ID</label>
                                    <input type="text" name="employee_id" placeholder="Optional ID" />
                                </div>
                                <button type="submit" className="btn-auth">Create Faculty Account</button>
                            </form>
                        )}

                        {showModal === "opportunity" && (
                            <form onSubmit={(e) => handleAddSubmit(e, "/api/admin/opportunities/add/", setOpportunities, opportunities, "opportunity")} className="auth-form">
                                <div className="form-group">
                                    <label>Job Title</label>
                                    <input type="text" name="job_title" required placeholder="e.g. Frontend Developer Intern" />
                                </div>
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input type="text" name="company_name" required placeholder="e.g. ABC Technologies" />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" required rows="2" placeholder="Describe the job role and contributions..." style={{ background: "rgba(11,15,25,0.8)", border: "1px solid var(--surface-border)", borderRadius: "8px", color: "#fff", padding: "10px", fontFamily: "inherit" }}></textarea>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                    <div className="form-group">
                                        <label>Job Type</label>
                                        <select name="job_type" required>
                                            <option value="internship">Internship</option>
                                            <option value="full_time">Full-time</option>
                                            <option value="part_time">Part-time</option>
                                            <option value="contract">Contract</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input type="text" name="location" required placeholder="e.g. Remote, New York" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Required Skills (Comma-separated)</label>
                                    <input type="text" name="required_skills" required placeholder="React, JavaScript, HTML, CSS" />
                                </div>
                                <div className="form-group">
                                    <label>Preferred Skills (Comma-separated)</label>
                                    <input type="text" name="preferred_skills" placeholder="Git, Django" />
                                </div>
                                <div className="form-group">
                                    <label>Salary Package</label>
                                    <input type="text" name="salary" placeholder="e.g. $25/hr, Unpaid" />
                                </div>
                                <button type="submit" className="btn-auth">Post Opportunity</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;