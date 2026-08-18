function Topbar({ username }) {
    return (
        <header className="topbar">

            <div>
                <h1>Dashboard</h1>

                <p>
                    Track your skills, achievements and career progress.
                </p>
            </div>

            <div className="topbar-right">

                <button className="notification-btn">
                    🔔
                    <span className="notification-dot">
                        3
                    </span>
                </button>

                <div className="user-menu">

                    <div className="user-avatar">
                        {username?.charAt(0)?.toUpperCase()}
                    </div>

                    <div>
                        <strong>{username}</strong>
                        <span>Student</span>
                    </div>

                    <span>⌄</span>

                </div>

            </div>

        </header>
    );
}

export default Topbar;