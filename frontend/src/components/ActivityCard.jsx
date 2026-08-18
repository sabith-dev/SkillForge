function ActivityCard() {

    return (
        <div className="dashboard-card">

            <div className="card-header">

                <div>
                    <h2>Recent Activity</h2>

                    <p>
                        Your latest SkillForge updates.
                    </p>
                </div>

                <a href="#">
                    View all
                </a>

            </div>

            <div className="activity-list">

                <div className="activity">

                    <div className="activity-icon">
                        ✓
                    </div>

                    <div>
                        <strong>
                            React skill verified
                        </strong>

                        <span>
                            Faculty verification completed
                        </span>

                        <small>
                            2 hours ago
                        </small>
                    </div>

                </div>

                <div className="activity">

                    <div className="activity-icon">
                        🚀
                    </div>

                    <div>
                        <strong>
                            GoBus project approved
                        </strong>

                        <span>
                            Your project has been verified
                        </span>

                        <small>
                            Yesterday
                        </small>
                    </div>

                </div>

                <div className="activity">

                    <div className="activity-icon">
                        📜
                    </div>

                    <div>
                        <strong>
                            Certificate submitted
                        </strong>

                        <span>
                            Python Programming certificate
                        </span>

                        <small>
                            2 days ago
                        </small>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default ActivityCard;