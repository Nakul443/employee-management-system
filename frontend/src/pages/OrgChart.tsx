// this file is used to display the organization hierarchy in a tree structure
// fetches the data from the backend and renders it using the TreeNode component

import { useEffect, useState } from 'react';
import api from '../services/api';
import { TreeNode } from '../components/OrgTree';

const OrgChart = () => {
    const [tree, setTree] = useState<any[]>([]);

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const { data } = await api.get('/organization/tree');
                setTree(data);
            } catch (error) {
                console.error("Error fetching org tree", error);
            }
        };
        fetchTree();
    }, []);

    return (
        <div className="org-chart-container">
            <h1>Organization Hierarchy</h1>
            {tree.map(rootEmployee => (
                <TreeNode key={rootEmployee.id} employee={rootEmployee} />
            ))}
        </div>
    );
};

export default OrgChart;