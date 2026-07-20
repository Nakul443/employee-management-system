import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/dashboard/metrics');
                // Format data for Recharts: array of objects
                const chartData = [
                    { name: 'Total', value: data.totalEmployees },
                    { name: 'Active', value: data.activeEmployees },
                    { name: 'Inactive', value: data.inactiveEmployees },
                    { name: 'Depts', value: data.departmentCount }
                ];
                setStats(chartData);
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            }
        };
        fetchDashboardData();
    }, []);

    if (!stats) return <div>Loading...</div>;

    return (
        <div className="dashboard-container" style={{ width: '100%', height: 400 }}>
            <h1>Dashboard Overview</h1>
            <ResponsiveContainer>
                <BarChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Dashboard;