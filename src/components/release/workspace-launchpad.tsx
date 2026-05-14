import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export function WorkspaceLaunchpad({ hasWorkspace }: { hasWorkspace: boolean }) {
  if (hasWorkspace) return null;

  return (
    <Card className="panel mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neon text-black">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Create your first creator workspace</h2>
            <CardDescription>Set your niche, AI workforce, and first workflow stack before running command-center operations.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/onboarding">
            Start Guided Onboarding
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
