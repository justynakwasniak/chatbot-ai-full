"use client"

import { FileText } from "lucide-react"
import type { MessageAttachment } from "@/lib/chat-data"

interface MessageAttachmentsProps {
  attachments: MessageAttachment[]
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (!attachments.length) return null

  return (
    <div className="mt-2 flex flex-col gap-2">
      {attachments.map((attachment) => {
        const isImage = attachment.mimeType.startsWith("image/")

        if (isImage && attachment.dataUrl) {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={attachment.id}
              src={attachment.dataUrl}
              alt={attachment.name}
              className="max-h-48 max-w-full rounded-lg border border-border/60 object-cover"
            />
          )
        }

        return (
          <div
            key={attachment.id}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/20 px-2.5 py-1.5 text-xs"
          >
            <FileText className="size-3.5 shrink-0 opacity-80" aria-hidden />
            <span className="truncate">{attachment.name}</span>
          </div>
        )
      })}
    </div>
  )
}
