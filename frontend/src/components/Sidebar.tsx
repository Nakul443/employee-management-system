// this file is used to display the sidebar navigation menu based on user roles

import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Call the backend logout endpoint
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout API failed, clearing local storage anyway", error);
        } finally {
            // Clear local storage and redirect to login
            localStorage.clear();
            navigate('/login');
        }
    };

    return (
        <nav className="sidebar">
            <ul>
                <li><Link to="/dashboard">Dashboard</Link></li>
                
                {/* only visible to HR and Super Admin */}
                {(user?.role === 'HR' || user?.role === 'SUPER_ADMIN') && (
                    <li><Link to="/employees">Manage Employees</Link></li>
                )}
                
                <li><Link to="/profile">My Profile</Link></li>

                {/* Logout Button */}
                <li>
                    <button 
                        onClick={handleLogout} 
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, font: 'inherit' }}
                    >
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Sidebar;