import { Brain } from "lucide-react";

export function Logo() {
  return (
    <div className="flex flex-col items-center gap-2 font-bold group-data-[collapsible=icon]:justify-center">
      <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-full shadow-lg">
        <Brain className="w-12 h-12 text-white" />
      </div>
      <span className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">
        Study <span className="text-blue-600">Coach</span>
      </span>
    </div>
  );
}
