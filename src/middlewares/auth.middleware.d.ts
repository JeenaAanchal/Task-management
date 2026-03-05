import { Request, Response, NextFunction } from "express";
interface JwtPayload {
    userId: string;
}
export declare const authenticate: (req: Request & {
    user?: JwtPayload;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map