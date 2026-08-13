import { BottomNav } from "@/components/BottomNav";
import { Dashboard, DashboardHeader } from "@/components/Dashboard";

export const metadata = {
  title: "Dashboard",
  description:
    "Your FXRP balance and vault positions on Flare Coston2, read live from the chain.",
};

export default function DashboardPage() {
  return (
    <div className="container-phone pb-safe">
      <DashboardHeader />
      <main className="mt-4 px-4">
        <Dashboard />
      </main>
      <BottomNav />
    </div>
  );
}
