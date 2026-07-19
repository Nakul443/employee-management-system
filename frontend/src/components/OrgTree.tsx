// this file is used to render the org tree structure

export const TreeNode = ({ employee }: { employee: any }) => {
    return (
        <div style={{ marginLeft: '20px', borderLeft: '1px solid #ccc', padding: '10px' }}>
            <strong>{employee.name}</strong> - {employee.designation}
            {employee.reports && employee.reports.length > 0 && (
                <div>
                    {employee.reports.map((report: any) => (
                        <TreeNode key={report.id} employee={report} />
                    ))}
                </div>
            )}
        </div>
    );
};