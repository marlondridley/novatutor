import Image from "next/image";
import { GraduationCap } from "lucide-react";

export function Logo() {
  return (
    <div className="flex flex-col items-center gap-2 font-bold group-data-[collapsible=icon]:justify-center">
      <div className="relative flex items-center justify-center w-20 h-20 bg-primary rounded-full shadow-lg">
        <Image 
          src="/supertutor-logo.png" 
          alt="SuperNOVA Tutor" 
          width={80}
          height={80}
          className="object-contain rounded-full"
          priority
          onError={(e) => {
            // Fallback to icon if image doesn't load
            e.currentTarget.style.display = 'none';
          }}
        />
        <GraduationCap className="absolute w-12 h-12 text-white" />
      </div>
      <span className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">
        Super<span className="text-blue-600">NOVA</span> <span className="text-primary">Tutor</span>
      </span>
    </div>
  );
}
