import Image from "next/image";
import { Button } from "@/components/home/button";
import backgroundImage from "@/public/background-call-to-action.jpg";

export function CallToAction() {
  return (
    <section
      id="get-started-today"
      className="relative overflow-hidden bg-blue-600 py-32"
    >
      <Image
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        src={backgroundImage}
        alt=""
        width={2347}
        height={1244}
        unoptimized
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Start sharing your wishes
          </h2>
          <p className="mt-4 text-xl tracking-tight text-white">
            Create your first wishlist today and make gift-giving a delightful
            experience for everyone involved.
          </p>
          <Button color="white" className="mt-10" href="/login">
            Create your wishlist
          </Button>
        </div>
      </div>
    </section>
  );
}
