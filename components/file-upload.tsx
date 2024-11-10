"use client";
import { useEffect, useState } from "react";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";

import { UploadDropzone } from "@/lib/uploadthing";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endPoint: "messageFile" | "serverImage";
}

export const FileUpload = ({ onChange, value, endPoint }: FileUploadProps) => {
  const [mimeType, setMimeType] = useState<string | null>(null);

  useEffect(() => {
    const fetchMimeType = async () => {
      if (value) {
        try {
          const response = await fetch(value);
          const type = response.headers.get("Content-Type");
          setMimeType(type);
        } catch (error) {
          console.error("Failed to fetch file headers:", error);
        }
      }
    };

    fetchMimeType();
  }, [value]);

  // Image preview for common image MIME types
  if (value && mimeType?.startsWith("image/")) {
    return (
      <div className="relative h-24 w-24">
        <Image src={value} alt="uploaded image" fill className="rounded-full" />
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4"/>
        </button>
      </div>
    );
  }

  // PDF preview
  if (value && mimeType === "application/pdf") {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10 cursor-pointer hover:underline">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a href={value} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-indigo-500">{"PDF File"}</a>
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4"/>
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endPoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error) => {
        console.log(error);
      }}
    />
  );
};
