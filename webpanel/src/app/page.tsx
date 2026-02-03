import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <h1 className="text-2xl font-bold">Welcome to Factory</h1>
      <p>Redirecting to overview...</p>
      <Button asChild>
        <Link href="/overview">Go to Overview</Link>
      </Button>
    </div>
  );
}
