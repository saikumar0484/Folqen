import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="grid min-h-[45vh] place-items-center">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-neon" />
        Preparing your creator workspace...
      </div>
    </div>
  );
}

