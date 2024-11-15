"use client";

import qs from "query-string";
import { ActionTooltip } from "../action-toolkit";
import { Video, VideoOff } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const ChatVideoButton = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isVideo = searchParams?.get("video");

  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname || "",
        query: {
          video: isVideo ? undefined : true,
        },
      },
      { skipNull: true }
    );

    router.push(url);
  };

  const Icon = isVideo ? VideoOff : Video;
  const tooltipLabel = isVideo ? "End video call" : "Start video call";

  return (
    <ActionTooltip side="bottom" align="center" label={tooltipLabel}>
      <button className="group flex items-center">
        <Icon
          onClick={onClick}
          className="h-6 w-6 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition"
        />
      </button>
    </ActionTooltip>
  );
};
