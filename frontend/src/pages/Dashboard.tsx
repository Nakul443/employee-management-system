import { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/dashboard/metrics');
                setStats(data);
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            }
        };
        fetchDashboardData();
    }, []);

    if (!stats) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <div className="stats-grid">
                <div className="stat-card">Total Employees: {stats.totalEmployees}</div>
                <div className="stat-card">Active: {stats.activeEmployees}</div>
                <div className="stat-card">Inactive: {stats.inactiveEmployees}</div>
                <div className="stat-card">Departments: {stats.departmentCount}</div>
            </div>
        </div>
    );
};

export default Dashboard;