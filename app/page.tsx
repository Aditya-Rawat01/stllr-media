import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import SupportChat from "@/components/SupportChat";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Navbar />
      <Hero />
      <SupportChat />
    </main>
  );
}
