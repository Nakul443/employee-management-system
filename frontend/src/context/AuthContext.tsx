// this file is used to manage user authentication state and provide it to the rest of the application

import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);

    // keep user state on page refresh
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // add API call later to fetch user details using the token
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};