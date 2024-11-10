"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import qs from "query-string";
import { Member, MemberRole, Profile } from "@prisma/client";
import { UserAvatar } from "../user-avatar";
import { ActionTooltip } from "../action-toolkit";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & {
    profile: Profile;
  };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-red-500" />,
};

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChatItem = ({ id, content, member, timestamp, fileUrl, deleted, currentMember, isUpdated, socketUrl, socketQuery }: ChatItemProps) => {
  const [mimeType, setMimeType] = useState<string | null>(null);
  const { onOpen } = useModal();
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();
  const params = useParams();

  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return;
    }
    if (member.id) {
      router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });
      await axios.patch(url, values);
      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    form.reset({ content: content });
  }, [content, form]);

  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = (isModerator || isAdmin || isOwner) && !deleted;
  const canEditMessage = isOwner && !deleted && !fileUrl;
  const isPDF = mimeType?.startsWith("application/pdf");
  const isImage = mimeType?.startsWith("image/");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isEditing) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing]);

  useEffect(() => {
    const fetchMimeType = async () => {
      if (fileUrl) {
        try {
          const response = await fetch(fileUrl);
          const type = response.headers.get("Content-Type");
          setMimeType(type);
        } catch (error) {
          console.error("Failed to fetch file headers:", error);
        }
      }
    };

    fetchMimeType();
  }, [fileUrl]);

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div onClick={onMemberClick} className="cursor-pointer hover:drop-shadow-md transition">
          <UserAvatar src={member.profile.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p onClick={onMemberClick} className="text-sm font-semibold hover:underline cursor-pointer">{member.profile.name}</p>
              <ActionTooltip side="top" align="center" label={member.role}>
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="max-h-40 text-xs text-zinc-500 dark:text-zinc-400">{timestamp}</span>
          </div>
          {isImage && (
            <a
              href={fileUrl || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex justify-center items-center h-48 w-48"
            >
              <Image fill src={fileUrl || ""} alt={content} />
            </a>
          )}
          {isPDF && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background dark:bg-neutral-800/60">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl || ""}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                PDF File
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p className={cn("text-sm text-zinc-600 dark:text-zinc-300", deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1")}>
              {content}
              {isUpdated && !deleted && <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">(edited)</span>}
            </p>
          )}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center w-full gap-x-2 pt-2">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="w-full relative">
                          <Input
                            disabled={isLoading}
                            className="p-2 bg-zinc-200/50 dark:bg-zinc-700/50 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                            placeholder="Edited message"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} type="submit" size="sm" variant="primary">
                  Save
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">Press escape to cancel, enter to save</span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && (
            <ActionTooltip side="top" align="center" label="Edit">
              <Edit
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
                onClick={() => setIsEditing(true)}
              />
            </ActionTooltip>
          )}
          <ActionTooltip side="top" align="center" label="Delete">
            <Trash
              className="cursor-pointer ml-auto w-4 h-4 text-rose-500 hover:text-rose-600 dark:text-rose-400 `dark:hover:text-rose-300 transition"
              onClick={() => onOpen("deleteMessage", { apiUrl: `${socketUrl}/${id}`, query: socketQuery })}
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
};
