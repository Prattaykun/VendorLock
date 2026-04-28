import DistributorControlTower from "@/components/dashboard/DistributorControlTower";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-slate-950 overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none mix-blend-luminosity" 
        style={{ backgroundImage: "url('/distributor-bg.jpeg')" }} 
      />
      <div className="fixed inset-0 z-0 bg-black/60 pointer-events-none" />
      <div className="relative z-10">
        <DistributorControlTower />
      </div>
    </main>
  );
}
