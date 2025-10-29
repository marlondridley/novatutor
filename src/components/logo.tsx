import { BrainCircuit, Sparkles } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-bold text-lg text-primary-foreground group-data-[collapsible=icon]:justify-center">
      <div className="relative flex items-center justify-center size-8 bg-primary text-primary-foreground rounded-lg">
        <BrainCircuit className="size-5" />
        <Sparkles className="size-3 absolute -top-1 -right-1 text-accent" />
      </div>
      <span className="group-data-[collapsible=icon]:hidden">SuperFocus</span>
    </div>
  );
}
