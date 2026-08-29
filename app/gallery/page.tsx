import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery — STLLR Media",
  description: "Complete visual portfolio of STLLR Media — photography, videography and events.",
};

export default function GalleryPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#080808]">
      <Navbar />
      <GalleryClient />
    </main>
  );
}
