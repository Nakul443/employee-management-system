import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState<any>(null);
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        api.get(`/employees/${user.id}`).then((res) => {
            setProfile(res.data);
            setPhone(res.data.phone || '');
        });
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/employees/${user!.id}`, { phone });
            alert('Profile updated');
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <div>
            <h1>My Profile</h1>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Designation:</strong> {profile.designation}</p>
            <label>
                Phone:
                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
            </button>
        </div>
    );
};

export default Profile;