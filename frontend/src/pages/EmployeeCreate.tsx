import { useNavigate } from 'react-router-dom';
import EmployeeForm from '../components/EmployeeForm';

const EmployeeCreate = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate('/employees');
    };

    return (
        <div className="employee-create-container" style={{ padding: '20px' }}>
            <h2>Create New Employee</h2>
            <EmployeeForm onSuccess={handleSuccess} />
        </div>
    );
};

export default EmployeeCreate;