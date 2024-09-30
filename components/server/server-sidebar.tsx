import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";

interface ServerSidebarProps {
  serverId: string;
}

/*************  ✨ Codeium Command ⭐  *************/
/**
 * ServerSidebar
 *
 * This component displays a sidebar with information about the server.
 * It currently shows the channels and members of the server.
 *
 * @param {ServerSidebarProps} props
 * @returns {JSX.Element}
 */
/**
 * ServerSidebarProps
 *
 * The props for the ServerSidebar component.
 *
 * @interface
 * @property {string} serverId - The ID of the server to display information about.
 */

/******  73518b7f-c2ca-4217-a3ef-7cafde30fd64  *******/ export const ServerSidebar =
  async ({ serverId }: ServerSidebarProps) => {
    const profile = await currentProfile();

    if (!profile) {
      return redirect("/");
    }

    const server = await db.server.findUnique({
      where: {
        id: serverId,
      },
      include: {
        channels: {
          orderBy: {
            createdAt: "asc",
          },
        },
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    const textChannels = server?.channels.filter(
      (channel) => channel.type === ChannelType.TEXT
    );
    const audioChannels = server?.channels.filter(
      (channel) => channel.type === ChannelType.AUDIO
    );
    const videoChannels = server?.channels.filter(
      (channel) => channel.type === ChannelType.VIDEO
    );

    const members = server?.members.filter(
      (member) => member.profileId !== profile.id
    );

    if (!server) {
      return redirect("/");
    }

    const role = server.members.find(
      (member) => member.profileId === profile.id
    )?.role;

    return (
      <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
        <ServerHeader server={server} role={role} />
      </div>
    );
  };

export default ServerSidebar;
