import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";

export function authMiddleware(handler: (req: Request, res: Response) => Promise<Response>) {
    return async (req: Request, res: Response) => {
        try {
            const profile = await currentProfile();
            if (!profile) {
                return new NextResponse("Unauthorized", { status: 401 });
            }
            return handler(req, res);
        } catch (error) {
            console.log(error);
            return new NextResponse("Unauthorized", { status: 401 });
        }
    }
}