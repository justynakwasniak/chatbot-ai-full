import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  label?: string
}

export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-primary", className)}
      aria-hidden={!label}
      aria-label={label}
    />
  )
}
