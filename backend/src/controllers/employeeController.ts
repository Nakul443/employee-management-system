import { type Request, type Response } from 'express';
import prisma from '../models/prismaClient.js';

export const getEmployees = async (req: Request, res: Response) => {
    const { name, email, department, role, status, sortBy } = req.query;
    try {
        const where: any = { isDeleted: false };
        if (name) where.name = { contains: name as string, mode: 'insensitive' };
        if (email) where.email = { contains: email as string, mode: 'insensitive' };
        if (department) where.departmentId = department as string;
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
        const employee = await prisma.user.findUnique({ where: { id: req.params.id as any}, include: { department: true } });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee', error });
    }
};

export const createEmployee = async (req: Request, res: Response) => {
    try {
        const employee = await prisma.user.create({ data: req.body });
        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error creating employee', error });
    }
};

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const employee = await prisma.user.update({ where: { id: req.params.id as any}, data: req.body });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error updating employee', error });
    }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        await prisma.user.update({ where: { id: req.params.id as any}, data: { isDeleted: true } });
        res.json({ message: 'Employee soft-deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting employee', error });
    }
};

export const getReportees = async (req: Request, res: Response) => {
    try {
        const employee = await prisma.user.findUnique({
            where: { id: req.params.id as any},
            include: { reportees: true }
        });
        res.json(employee?.reportees || []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reportees', error });
    }
};

export const updateManager = async (req: Request, res: Response) => {
    try {
        const { managerId } = req.body;
        const employee = await prisma.user.update({
            where: { id: req.params.id as any},
            data: { managerId }
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error updating manager', error });
    }
};