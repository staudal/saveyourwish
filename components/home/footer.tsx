import Link from "next/link";
import Image from "next/image";

import Logo from "@/public/logo.png";

const navigation = {
  main: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  const d = new Date();
  const year = d.getFullYear();
  return (
    <footer className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-10 space-y-6">
          <Image src={Logo} alt="Logo" className="mx-auto h-10 w-auto" />
          <nav>
            <div className="mx-auto max-w-7xl overflow-hidden px-6 lg:px-8 space-y-6">
              <nav
                aria-label="Footer"
                className="flex justify-center space-x-6"
              >
                {navigation.main.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </nav>
              <p className="text-sm leading-5 text-gray-600 text-center">
                &copy; {`${year}`} Built by
                <Link
                  target="_blank"
                  href="https://builtbyjakob.com"
                  className="ml-1 underline hover:text-neutral-600"
                >
                  Jakob Staudal
                </Link>
                . All rights reserved.
              </p>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}
