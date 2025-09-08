import { Suspense } from "react";
import Loading from "@/app/loading";
import { SessionGuard } from "@/app/dashboard/_components/session-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard protectAll>
      <Suspense fallback={<Loading />}> 
        <div className="min-h-screen">
          {children}
        </div>
      </Suspense>
    </SessionGuard>
  );
}
