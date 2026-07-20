// this file is used to create or update an employee

import { useState } from 'react';
import api from '../services/api';

const EmployeeForm = ({ employee, onSuccess }: any) => {
    const [formData, setFormData] = useState(employee || {
        name: '', email: '', phone: '', department: '', designation: '', 
        salary: '', joiningDate: '', status: 'ACTIVE', role: 'EMPLOYEE'
    });

    const validate = () => {
        if (!formData.name || !formData.email || !formData.salary || !formData.department) {
            alert("Required fields are missing.");
            return false;
        }
        if (isNaN(Number(formData.salary))) {
            alert("Salary must be a number.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            if (employee?.id) {
                await api.put(`/employees/${employee.id}`, formData);
            } else {
                await api.post('/employees', formData);
            }
            onSuccess();
        } catch (error) {
            alert("Action failed. Please check validation rules.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input placeholder="Department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
            <input placeholder="Designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
            <input placeholder="Salary" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
            <input type="date" value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} />
            
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
            </select>

            <button type="submit">{employee ? 'Update' : 'Create'} Employee</button>
        </form>
    );
};

export default EmployeeForm;