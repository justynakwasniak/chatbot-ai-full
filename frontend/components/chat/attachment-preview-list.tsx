"use client"

import { FileText, X } from "lucide-react"
import type { PendingAttachment } from "@/lib/attachments"
import { cn } from "@/lib/utils"

interface AttachmentPreviewListProps {
  attachments: PendingAttachment[]
  onRemove: (id: string) => void
  disabled?: boolean
}

export function AttachmentPreviewList({
  attachments,
  onRemove,
  disabled = false,
}: AttachmentPreviewListProps) {
  if (attachments.length === 0) return null

  return (
    <div className="mx-auto mb-2 flex max-w-3xl flex-wrap gap-2">
      {attachments.map((attachment) => {
        const isImage = attachment.mimeType.startsWith("image/")

        return (
          <div
            key={attachment.id}
            className="glass flex items-center gap-2 rounded-xl border border-border px-2 py-1.5 text-xs"
          >
            {isImage && attachment.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={attachment.previewUrl}
                alt={attachment.name}
                className="size-10 rounded-lg object-cover"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <FileText className="size-4" aria-hidden />
              </div>
            )}
            <span className="max-w-[10rem] truncate text-foreground">{attachment.name}</span>
            <button
              type="button"
              onClick={() => onRemove(attachment.id)}
              disabled={disabled}
              className={cn(
                "focus-ring rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground",
                disabled && "cursor-not-allowed opacity-40",
              )}
              aria-label={`Remove ${attachment.name}`}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}
