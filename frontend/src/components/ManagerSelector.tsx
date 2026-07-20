// this file is used to select a manager for an employee

import { useState, useEffect } from 'react';
import api from '../services/api';

const ManagerSelector = ({ employeeId, currentManagerId, onUpdate }: any) => {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        // Fetch all employees to list them as potential managers
        api.get('/employees').then((res) => setEmployees(res.data.data));
    }, []);

    const handleAssign = async (managerIdRaw: string) => {
        try {
            const managerId = managerIdRaw === "" ? null : Number(managerIdRaw);
            await api.patch(`/employees/${employeeId}/manager`, { managerId });
            onUpdate();
            alert('Manager assigned successfully');
        } catch (error) {
            alert('Failed to assign manager. Please check for circular reporting.');
        }
    };

    return (
        <select 
            defaultValue={currentManagerId || ""} 
            onChange={(e) => handleAssign(e.target.value)}
        >
            <option value="">No Manager</option>
            {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
        </select>
    );
};

export default ManagerSelector;