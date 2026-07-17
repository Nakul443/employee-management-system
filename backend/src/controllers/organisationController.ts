// logic for and hierarchy

import { type Request, type Response } from 'express';
import prisma from '../models/prismaClient.js';

export const getOrgTree = async (req: Request, res: Response) => {
    try {
        // Fetch users and structure them recursively
        // This query finds the top-level managers and includes their direct reports
        const tree = await prisma.user.findMany({
            where: { managerId: null }, // Assuming top-level has no manager
            include: {
                reportees: {
                    include: {
                        reportees: {
                            include: {
                                reportees: true // You can extend this nesting based on depth needs
                            }
                        }
                    }
                }
            }
        });
        res.json(tree);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organizational tree', error });
    }
};