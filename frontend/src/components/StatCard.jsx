function StatCard({
    title,
    value,
    subtitle,
    icon,
    className = ""
}) {
    return (
        <div className={`stat-card ${className}`}>

            <div className="stat-icon">
                {icon}
            </div>

            <div className="stat-content">

                <span>{title}</span>

                <strong>{value}</strong>

                <small>{subtitle}</small>

            </div>

        </div>
    );
}

export default StatCard;