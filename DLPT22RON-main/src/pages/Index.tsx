import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TechnologySection } from "@/components/landing/TechnologySection";
import { UseCasesSection } from "@/components/landing/UseCasesSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        {/* <AboutSection /> */}
        <FeaturesSection />
        {/* <TechnologySection /> */}
        <UseCasesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
