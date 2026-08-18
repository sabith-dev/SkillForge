function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                <div className="logo-mark">S</div>

                <div>
                    <h2>SkillForge</h2>
                    <span>Career Platform</span>
                </div>
            </div>

            <nav className="sidebar-nav">

                <div className="nav-section">
                    <span className="nav-title">MAIN</span>

                    <a href="#" className="nav-item active">
                        <span>▦</span>
                        Dashboard
                    </a>

                    <a href="#" className="nav-item">
                        <span>👤</span>
                        My Profile
                    </a>

                    <a href="#" className="nav-item">
                        <span>⚡</span>
                        My Skills
                    </a>

                    <a href="#" className="nav-item">
                        <span>▣</span>
                        Projects
                    </a>
                </div>

                <div className="nav-section">

                    <span className="nav-title">
                        CAREER
                    </span>

                    <a href="#" className="nav-item">
                        <span>📜</span>
                        Certificates
                    </a>

                    <a href="#" className="nav-item">
                        <span>💼</span>
                        Internships
                    </a>

                    <a href="#" className="nav-item">
                        <span>🏆</span>
                        Achievements
                    </a>

                    <a href="#" className="nav-item">
                        <span>🚀</span>
                        Opportunities
                    </a>

                    <a href="#" className="nav-item">
                        <span>🧭</span>
                        Career Roadmap
                    </a>

                </div>

                <div className="nav-section">

                    <span className="nav-title">
                        PORTFOLIO
                    </span>

                    <a href="#" className="nav-item">
                        <span>🌐</span>
                        My Portfolio
                    </a>

                </div>

            </nav>

            <div className="sidebar-bottom">

                <a href="#" className="nav-item">
                    <span>⚙</span>
                    Settings
                </a>

                <a href="#" className="nav-item logout">
                    <span>↪</span>
                    Logout
                </a>

            </div>

        </aside>
    );
}

export default Sidebar;