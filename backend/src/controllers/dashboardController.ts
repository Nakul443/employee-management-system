import { type Request, type Response } from 'express';
import prisma from '../models/prismaClient.js';

export const getDashboardMetrics = async (res: Response) => {
    try {
        const [total, active, inactive, departments] = await Promise.all([
            prisma.user.count({ where: { isDeleted: false } }),
            prisma.user.count({ where: { isDeleted: false, status: 'ACTIVE' } }),
            prisma.user.count({ where: { isDeleted: false, status: 'INACTIVE' } }),
            prisma.department.findMany({ include: { _count: { select: { employees: true } } } })
        ]);

        res.json({
            total,
            active,
            inactive,
            departmentBreakdown: departments.map(d => ({
                name: d.name,
                count: d._count.employees
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard metrics', error });
    }
};