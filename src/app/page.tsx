import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Merchants from "@/components/landing/Merchants";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Merchants />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
