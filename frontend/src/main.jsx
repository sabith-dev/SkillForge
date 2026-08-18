import React from "react";
import ReactDOM from "react-dom/client";

import StudentDashboard from "./dashboards/StudentDashboard.jsx";
import FacultyDashboard from "./dashboards/FacultyDashboard.jsx";
import AdminDashboard from "./dashboards/AdminDashboard.jsx";

// Import global styles
import "./styles/dashboard.css";

// Parse initial data injected by Django
const dataElement = document.getElementById("dashboard-data");
const initialData = dataElement ? JSON.parse(dataElement.textContent) : {};

function App() {
    const role = initialData.user?.role?.toLowerCase() || "student";

    if (role === "faculty") {
        return <FacultyDashboard initialData={initialData} />;
    }

    if (role === "admin") {
        return <AdminDashboard initialData={initialData} />;
    }

    return <StudentDashboard initialData={initialData} />;
}

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);