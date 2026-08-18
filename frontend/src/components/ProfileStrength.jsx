function ProfileStrength() {

    const strength = 82;

    return (
        <div className="dashboard-card profile-strength">

            <div className="card-header">

                <div>
                    <h2>Profile Strength</h2>
                    <p>
                        Complete your profile to stand out.
                    </p>
                </div>

                <span className="percentage">
                    {strength}%
                </span>

            </div>

            <div className="progress-container">

                <div
                    className="progress-bar"
                    style={{
                        width: `${strength}%`
                    }}
                />

            </div>

            <div className="profile-checklist">

                <div className="completed">
                    ✓ Profile photo
                </div>

                <div className="completed">
                    ✓ Bio
                </div>

                <div className="completed">
                    ✓ Skills
                </div>

                <div className="completed">
                    ✓ Projects
                </div>

                <div className="pending">
                    + Add LinkedIn
                </div>

                <div className="pending">
                    + Add GitHub
                </div>

            </div>

        </div>
    );
}

export default ProfileStrength;