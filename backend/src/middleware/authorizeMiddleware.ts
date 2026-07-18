// validation of roles

import { type Request, type Response, type NextFunction } from 'express';
import { type Role } from '../generated/prisma/client.js';

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
    }

    next();
  };
};