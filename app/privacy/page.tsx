import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className="bg-white h-full min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-black">
            Privacy Policy
          </h1>
          <div className="mt-8 space-y-8 text-base text-slate-600">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                Overview
              </h2>
              <p className="mt-4">
                This privacy policy describes how we collect, use, and protect
                your information when you use our wishlist service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                Information We Collect
              </h2>
              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>Account information: Email address for authentication</li>
                <li>
                  Wishlist data: Titles, descriptions, prices, and URLs of items
                  you add
                </li>
                <li>Image data: Images you upload or link to your wishes</li>
                <li>
                  Reservation data: Names of people who reserve items from your
                  wishlists
                </li>
                <li>Usage preferences: Language and theme settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                How We Use Your Information
              </h2>
              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>To create and manage your wishlists</li>
                <li>To enable sharing of wishlists with others</li>
                <li>To facilitate gift reservations</li>
                <li>To provide multilingual support</li>
                <li>To remember your display preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                Information Sharing
              </h2>
              <p className="mt-4">
                When you share a wishlist, the following information becomes
                visible to anyone with the link:
              </p>
              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>Wishlist title and contents</li>
                <li>Item details (descriptions, prices, images)</li>
                <li>
                  Reservation status (but not who reserved items, unless
                  you&apos;re logged in)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                Data Protection
              </h2>
              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>We use secure authentication to protect your account</li>
                <li>Wishlist sharing is controlled through unique share IDs</li>
                <li>You can disable sharing for any wishlist at any time</li>
                <li>
                  We don&apos;t share your personal information with third
                  parties
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                Your Rights
              </h2>
              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>You can edit or delete your wishlists at any time</li>
                <li>You can enable or disable sharing for your wishlists</li>
                <li>
                  You can request deletion of your account and all associated
                  data
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
