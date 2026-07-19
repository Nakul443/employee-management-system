import { useEffect, useState } from 'react';
import api from '../services/api';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [filters, setFilters] = useState({ name: '', page: 1 });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                // Fetch filtered and paginated data
                const { data } = await api.get('/employees', { params: filters });
                setEmployees(data.data);
                setMeta(data.meta);
            } catch (error) {
                console.error("Error fetching employees", error);
            }
        };
        fetchEmployees();
    }, [filters]);

    return (
        <div className="employee-list-container">
            <input 
                placeholder="Search by name..." 
                onChange={(e) => setFilters({...filters, name: e.target.value})} 
            />
            
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp: any) => (
                        <tr key={emp.id}>
                            <td>{emp.name}</td>
                            <td>{emp.email}</td>
                            <td>{emp.status}</td>
                            <td>{emp.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div>
                <button 
                    disabled={filters.page === 1} 
                    onClick={() => setFilters({...filters, page: filters.page - 1})}
                >Previous</button>
                <span>Page {meta.page} of {meta.totalPages}</span>
                <button 
                    disabled={filters.page === meta.totalPages} 
                    onClick={() => setFilters({...filters, page: filters.page + 1})}
                >Next</button>
            </div>
        </div>
    );
};

export default EmployeeList;