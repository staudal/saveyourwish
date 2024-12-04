import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="bg-white h-full min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-black">
            Terms of Service
          </h1>
          <div className="mt-8 space-y-8 text-base text-slate-600">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                1. Terms
              </h2>
              <p className="mt-4">
                By accessing this website, you agree to be bound by these terms
                of service and agree that you are responsible for compliance
                with any applicable local laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                2. Use License
              </h2>
              <p className="mt-4">
                This is a free service. You may create wishlists and share them
                with others. You are responsible for the content you add to your
                wishlists.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                3. Disclaimer
              </h2>
              <p className="mt-4">
                The service is provided &quot;as is&quot;. We make no warranties
                about the completeness, reliability, or accuracy of this
                service.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
