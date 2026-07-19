// this file is used to define the layout of the application, including the sidebar and main content area

import { JSX } from 'react/jsx-runtime';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: JSX.Element }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '20px' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;