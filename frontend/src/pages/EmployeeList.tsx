import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ManagerSelector from '../components/ManagerSelector';

const EmployeeList = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [filters, setFilters] = useState({ name: '', page: 1 });

    // fetch employees based on current filters and pagination
    const fetchEmployees = useCallback(async () => {
        try {
            const { data } = await api.get('/employees', { params: filters });
            setEmployees(data.data);
            setMeta(data.meta);
        } catch (error) {
            console.error("Error fetching employees", error);
        }
    }, [filters]);

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                await api.delete(`/employees/${id}`);
                fetchEmployees();
            } catch (error) {
                alert("Failed to delete.");
            }
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    return (
        <div className="employee-list-container" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <input 
                    placeholder="Search by name..." 
                    onChange={(e) => setFilters({...filters, name: e.target.value})} 
                    style={{ padding: '8px', width: '250px' }}
                />
                <button 
                    onClick={() => navigate('/employees/new')} 
                    style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 16px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
                >
                    + Create Employee
                </button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Role</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Manager</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp: any) => (
                        <tr key={emp.id} style={{ borderBottom: '1px solid #444' }}>
                            <td style={{ padding: '8px' }}>{emp.name}</td>
                            <td style={{ padding: '8px' }}>{emp.email}</td>
                            <td style={{ padding: '8px' }}>{emp.status}</td>
                            <td style={{ padding: '8px' }}>{emp.role}</td>
                            <td style={{ padding: '8px' }}>
                                <ManagerSelector 
                                    employeeId={emp.id} 
                                    currentManagerId={emp.managerId} 
                                    onUpdate={fetchEmployees} 
                                />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <button onClick={() => handleDelete(emp.id)} style={{ padding: '4px 8px', cursor: 'pointer' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
                <button 
                    disabled={filters.page === 1} 
                    onClick={() => setFilters({...filters, page: filters.page - 1})}
                    style={{ padding: '6px 12px', cursor: 'pointer' }}
                >Previous</button>
                <span>Page {meta.page} of {meta.totalPages}</span>
                <button 
                    disabled={filters.page === meta.totalPages} 
                    onClick={() => setFilters({...filters, page: filters.page + 1})}
                    style={{ padding: '6px 12px', cursor: 'pointer' }}
                >Next</button>
            </div>
        </div>
    );
};

export default EmployeeList;