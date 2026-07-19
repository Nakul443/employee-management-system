// file for extending the Express Request interface to include a user property

import { type Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };
    }
  }
}