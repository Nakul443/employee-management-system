// logic for login and logout

import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient.js';
import { hash } from 'bcrypt';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET as string, 
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error instanceof Error ? error.message : error });
    }
};

export const logout = (req: Request, res: Response) => {
    // If using cookies, clear them here. Otherwise, client-side handles token removal.
    res.clearCookie('token'); 
    res.json({ message: 'Logout successful' });
};