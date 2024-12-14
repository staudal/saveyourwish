import { CallToAction } from "@/components/home/cta";
import { Faqs } from "@/components/home/faq";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { PrimaryFeatures } from "@/components/home/primary-features";
import { SecondaryFeatures } from "@/components/home/secondary-features";
import { type Metadata } from "next";
import { faqs } from "@/components/home/faq";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.flat().map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="bg-white">
        <Header />
      </header>
      <main className="bg-white">
        <article>
          <Hero />
          <section aria-labelledby="features-heading">
            <PrimaryFeatures />
          </section>
          <section aria-labelledby="secondary-features-heading">
            <SecondaryFeatures />
          </section>
          <section aria-labelledby="cta-heading">
            <CallToAction />
          </section>
          <section aria-labelledby="faq-heading">
            <Faqs />
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}

export const metadata: Metadata = {
  alternates: {
    canonical: "https://saveyourwish.com",
  },
};
