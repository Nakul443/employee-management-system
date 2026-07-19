// this file is used to display the sidebar navigation menu based on user roles

import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    return (
        <nav className="sidebar">
            <ul>
                <li><Link to="/dashboard">Dashboard</Link></li>
                
                {/* only visible to HR and Super Admin */}
                {(user?.role === 'HR' || user?.role === 'SUPER_ADMIN') && (
                    <li><Link to="/employees">Manage Employees</Link></li>
                )}
                
                <li><Link to="/profile">My Profile</Link></li>
            </ul>
        </nav>
    );
};

export default Sidebar;