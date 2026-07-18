// logic for and hierarchy

import { type Request, type Response } from 'express';
import prisma from '../models/prismaClient.js';

export const getOrgTree = async (req: Request, res: Response) => {
    try {
        const allUsers = await prisma.user.findMany({ where: { isDeleted: false } });
        
        const buildTree = (managerId: string | null): any[] => {
            return allUsers
                .filter(user => user.managerId === managerId)
                .map(user => ({
                    ...user,
                    reportees: buildTree(user.id)
                }));
        };

        res.json(buildTree(null));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organizational tree', error });
    }
};