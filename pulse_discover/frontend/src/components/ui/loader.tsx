import { Loader as LucideLoader } from "lucide-react";
import { cn } from "@/lib/utils";

export function Loader({ className }: { className?: string }) {
  return <LucideLoader className={cn("animate-spin", className)} />;
}
