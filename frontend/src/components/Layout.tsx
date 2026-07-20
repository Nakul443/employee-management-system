// this file is used to define the layout of the application, including the sidebar and main content area

import { JSX } from 'react/jsx-runtime';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: JSX.Element }) => {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="app-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;