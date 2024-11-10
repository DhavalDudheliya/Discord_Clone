import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { channelId: string } }) {

    try {
        const profile = await currentProfile();

        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID is missing", { status: 400 });
        }

        if (!params.channelId) {
            return new NextResponse("Channel ID is missing", { status: 400 });
        }


        await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                channels: {
                    delete: {
                        id: params.channelId,
                        name: {
                            not: "general"
                        }
                    }
                }
            }
        })


        return new NextResponse("Channel deleted successfully", { status: 200 });

    } catch (error) {
        console.log(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { channelId: string } }) {

    try {
        const profile = await currentProfile();
        const { name, type} = await req.json();
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID is missing", { status: 400 });
        }

        if (!params.channelId) {
            return new NextResponse("Channel ID is missing", { status: 400 });
        }

        if(name === 'general') {
            return new NextResponse("General channel cannot be updated", { status: 400 });
        }


        const server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                channels: {
                   update: {
                       where: {
                           id: params.channelId,
                           name: {
                               not: "general"
                           },
                       },
                       data: {
                           name,
                           type
                       }
                   }
                }
            }
        })


        return NextResponse.json({ message: "Channel updated successfully", server }, { status: 200 });

    } catch (error) {
        console.log(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}