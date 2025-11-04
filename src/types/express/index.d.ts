// src/types/express/index.d.ts

// Define the payload structure of our JWT
interface IAdminPayload {
  adminId: number;
  email: string;
}

// Use declaration merging to add a new property to the Express Request interface
declare namespace Express {
  export interface Request {
    admin?: IAdminPayload;
  }
}
