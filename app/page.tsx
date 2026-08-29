import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import SelectedWork from "@/components/sections/SelectedWork";
import Services from "@/components/sections/Services";
import UpcomingEvents from "@/components/sections/UpcomingEvents";
import Contact from "@/components/sections/Contact";
import SupportChat from "@/components/SupportChat";
import NotAdminToast from "@/components/NotAdminToast";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <NotAdminToast />
      </Suspense>
      <Hero />
      <About />
      <SelectedWork />
      <Services />
      <UpcomingEvents />
      <Contact />
      <SupportChat />
    </main>
  );
}
