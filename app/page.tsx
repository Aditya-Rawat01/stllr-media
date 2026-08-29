import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import SelectedWork from "@/components/sections/SelectedWork";
import SupportChat from "@/components/SupportChat";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Navbar />
      <Hero />
      <About />
      <SelectedWork />
      <SupportChat />
    </main>
  );
}
