// validation and acceptance of roles
import { type Request, type Response, type NextFunction } from 'express';

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
    }

    next();
  };
};