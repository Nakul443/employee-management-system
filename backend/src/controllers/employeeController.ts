// logic for employee management (CRUD operations)

import { type Request, type Response } from 'express';
import prisma from '../models/prismaClient.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import csv from 'csv-parser';

export const importEmployees = async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const results: any[] = [];
    
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                const formattedData = await Promise.all(results.map(async (row) => {
                    const hashedPassword = await bcrypt.hash(row.password || 'Temporary123!', 10);
                    return {
                        email: row.email,
                        password: hashedPassword,
                        name: row.name,
                        phone: row.phone || null,
                        designation: row.designation || null,
                        salary: row.salary ? parseFloat(row.salary) : null,
                        joiningDate: row.joiningDate ? new Date(row.joiningDate) : new Date(),
                        status: (row.status as any) || 'ACTIVE',
                        role: (row.role as any) || 'EMPLOYEE',
                        departmentId: row.departmentId ? parseInt(row.departmentId, 10) : null,
                        managerId: row.managerId ? parseInt(row.managerId, 10) : null,
                    };
                }));

                await prisma.user.createMany({ 
                    data: formattedData,
                    skipDuplicates: true 
                });
                
                fs.unlinkSync(req.file!.path); // Clean up temp file
                res.json({ message: 'Import successful', count: formattedData.length });
            } catch (error) {
                res.status(500).json({ message: 'Error processing CSV', error });
            }
        });
};

async function isReportee(targetId: number, employeeId: number): Promise<boolean> {
    const directReports = await prisma.user.findMany({
        where: { managerId: employeeId },
        select: { id: true }
    });

    for (const reportee of directReports) {
        if (reportee.id === targetId) return true;
        if (await isReportee(targetId, reportee.id)) return true;
    }
    return false;
}

// get employees
export const getEmployees = async (req: Request, res: Response) => {
    const { name, email, department, role, status, sortBy } = req.query;
    try {
        const where: any = { isDeleted: false };
        if (name) where.name = { contains: name as string, mode: 'insensitive' };
        if (email) where.email = { contains: email as string, mode: 'insensitive' };
        if (department) where.departmentId = parseInt(department as string, 10);
        if (role) where.role = role as any;
        if (status) where.status = status as any;

        const orderBy: any = sortBy === 'joiningDate' ? { joiningDate: 'desc' } : { name: 'asc' };

        const employees = await prisma.user.findMany({ where, orderBy, include: { department: true } });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error });
    }
};

export const getEmployeeById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        const requester = req.user!; // set by authMiddleware

        if (requester.role === 'EMPLOYEE' && requester.id !== id) {
            return res.status(403).json({ message: 'Forbidden: cannot view other employee profiles' });
        }

        const employee = await prisma.user.findUnique({ where: { id }, include: { department: true } });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee', error });
    }
};

export const createEmployee = async (req: Request, res: Response) => {
    try {
        const { password, ...rest } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const employee = await prisma.user.create({
            data: { ...rest, password: hashedPassword }
        });

        const { password: _, ...employeeWithoutPassword } = employee;
        res.status(201).json(employeeWithoutPassword);
    } catch (error: any) { 
        // Log to terminal for your debugging
        console.error("Prisma Error:", error); 
        
        // Return the actual error message to Postman
        res.status(500).json({ 
            message: 'Error creating employee', 
            error: error.message || "Unknown error" 
        });
    }
};

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        const requester = req.user!;
        const isSelf = requester.id === id;

        if (requester.role === 'EMPLOYEE' && !isSelf) {
            return res.status(403).json({ message: 'Forbidden: cannot edit other profiles' });
        }

        let data = { ...req.body };

        // Employees can only touch limited fields on their own profile
        if (requester.role === 'EMPLOYEE') {
            const allowedFields = ['phone', 'profileImage', 'password'];
            data = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );
        }

        // Only SUPER_ADMIN can assign the SUPER_ADMIN role
        if (data.role === 'SUPER_ADMIN' && requester.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Forbidden: only Super Admin can assign Super Admin role' });
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const employee = await prisma.user.update({ where: { id }, data });
        const { password: _, ...employeeWithoutPassword } = employee;
        res.json(employeeWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Error updating employee', error });
    }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        await prisma.user.update({ where: { id }, data: { isDeleted: true } });
        res.json({ message: 'Employee soft-deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting employee', error });
    }
};

export const getReportees = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string, 10);
        const employee = await prisma.user.findUnique({
            where: { id },
            include: { reportees: true }
        });
        res.json(employee?.reportees || []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reportees', error });
    }
};

// Replace your updateManager with this logic
export const updateManager = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const { managerId } = req.body;

    try {
        if (id === managerId) {
            return res.status(400).json({ message: 'An employee cannot be their own manager' });
        }

        if (managerId !== null) {
            const isSubordinate = await isReportee(id, managerId);
            if (isSubordinate) {
                return res.status(400).json({ message: 'Circular dependency: Cannot assign a subordinate as a manager' });
            }
        }

        const employee = await prisma.user.update({
            where: { id },
            data: { managerId: managerId ? parseInt(managerId) : null }
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error updating manager', error });
    }
};