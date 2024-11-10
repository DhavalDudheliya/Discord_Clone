import ChatHeader from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ChannelIdPageProps {
    params: {
        serverId: string;
        channelId: string;
    }
}

const ChannelPage = async ( { params }: ChannelIdPageProps ) => {

    const profile = await currentProfile();

    if (!profile) {
        return auth().redirectToSignIn();
    }

    const channel = await db.channel.findUnique({
        where: {
            id: params.channelId
        }
    });

    const member = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id
        }
    });

    if(!channel || !member) {
        redirect("/");
    }

    return (
      <div className="bg-white dark:bg-[#303030] flex flex-col h-full">
       <ChatHeader name={channel.name} serverId={channel.serverId} type="channel" />
       <div className="flex-1">
        Future Messages
       </div>
       <ChatInput apiUrl='/api/socket/messages' name={channel.name} type="channel" query={{serverId:channel.serverId, channelId: channel.id}} />
      </div>
    );
}
 
export default ChannelPage;