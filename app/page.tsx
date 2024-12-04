import { CallToAction } from "@/components/home/cta";
import { Faqs } from "@/components/home/faq";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { PrimaryFeatures } from "@/components/home/primary-features";
import { SecondaryFeatures } from "@/components/home/secondary-features";

export default function Home() {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <Hero />
        <PrimaryFeatures />
        <SecondaryFeatures />
        <CallToAction />
        {/* <Testimonials /> */}
        <Faqs />
      </main>
      <Footer />
    </div>
  );
}
