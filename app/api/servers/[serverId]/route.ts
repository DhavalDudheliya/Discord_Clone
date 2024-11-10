import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: {
    params: {
        serverId: string
    }
}) {
    try {
        const profile = await currentProfile();
        const { name, imageUrl } = await req.json();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.serverId) {
            return new NextResponse("Server ID is Missing", { status: 400 });
        }

        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id
            },
            data: {
                name,
                imageUrl
            }
        });

        return NextResponse.json({ message: "Server updated successfully", server: server }, { status: 200 });

    } catch (error) {
        console.log(error);
    }
}

export async function DELETE(req: Request, { params }: { params: { serverId: string } }) {
    try{
        const profile = await currentProfile();

        if(!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if(!params.serverId) {
            return new NextResponse("Server ID is missing", { status: 400 });
        }

        await db.server.delete({
            where: {
                id: params.serverId,
                profileId: profile.id
            }
        })

        return new NextResponse("Server deleted successfully", { status: 200 });
    } catch (error) {
        console.log(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}