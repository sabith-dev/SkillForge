function CareerScore() {

    return (
        <div className="dashboard-card career-score">

            <div className="card-header">

                <div>
                    <h2>Career Score</h2>

                    <p>
                        Your overall career readiness.
                    </p>
                </div>

                <span className="score-badge">
                    Good
                </span>

            </div>

            <div className="score-display">

                <div className="score-circle">

                    <strong>78</strong>

                    <span>/100</span>

                </div>

                <div className="score-details">

                    <div>
                        <span>Skills</span>
                        <strong>18/20</strong>
                    </div>

                    <div>
                        <span>Projects</span>
                        <strong>16/20</strong>
                    </div>

                    <div>
                        <span>Certificates</span>
                        <strong>12/15</strong>
                    </div>

                    <div>
                        <span>Experience</span>
                        <strong>15/20</strong>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default CareerScore;