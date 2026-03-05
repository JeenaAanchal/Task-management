import { Response } from "express";
interface AuthRequest<P = any, Q = any, B = any> extends Express.Request {
    user?: {
        userId: string;
    };
    params: P;
    query: Q;
    body: B;
}
export declare const createTask: (req: AuthRequest<{}, {}, {
    title: string;
    description?: string;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getTasks: (req: AuthRequest<{}, {
    page?: string;
    limit?: string;
    status?: string;
    search?: string;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleTask: (req: AuthRequest<{
    id: string;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteTask: (req: AuthRequest<{
    id: string;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateTask: (req: AuthRequest<{
    id: string;
}, {}, {
    title?: string;
    description?: string;
    status?: "PENDING" | "COMPLETED";
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=task.controller.d.ts.map