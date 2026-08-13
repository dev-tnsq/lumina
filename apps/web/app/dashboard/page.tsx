import { Dashboard, DashboardHeader } from "@/components/Dashboard";

export const metadata = {
  title: "Dashboard",
  description:
    "Your FXRP balance and vault positions on Flare Coston2, read live from the chain.",
};

export default function DashboardPage() {
  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-2xl">
        <DashboardHeader />
        <main className="mt-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
