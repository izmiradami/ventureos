import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { DemoSection } from "@/components/landing/demo-section";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Features />
      <DemoSection />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  );
}
