// logic for employee management (CRUD operations)

import { type Request, type Response } from 'express';
import prisma from '../models/prismaClient.js';
import bcrypt from 'bcrypt';

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
        if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
        }
        const employee = await prisma.user.update({ where: { id }, data: req.body });
        res.json(employee);
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

export const updateManager = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const { managerId } = req.body;

    try {
        if (id === managerId) {
            return res.status(400).json({ message: 'An employee cannot be their own manager' });
        }

        if (managerId && (await isReportee(managerId, id))) {
            return res.status(400).json({ message: 'Circular dependency: Cannot assign a subordinate as a manager' });
        }

        const employee = await prisma.user.update({
            where: { id },
            data: { managerId }
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error updating manager', error });
    }
};