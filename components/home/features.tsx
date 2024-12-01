import { GiftIcon, ShareIcon, HeartIcon } from "@heroicons/react/20/solid";

const features = [
  {
    name: "Make a list.",
    description:
      "Design your wishlist with all the details that matter. Add images, prices, and notes to make each wish special.",
    icon: GiftIcon,
  },
  {
    name: "Spread the joy.",
    description:
      "Let friends and family know what you&apos;d love to receive. They can reserve items to avoid duplicates.",
    icon: ShareIcon,
  },
  {
    name: "Stay organized.",
    description:
      "Create separate lists for birthdays, holidays, or any special occasion, and stay organized.",
    icon: HeartIcon,
  },
];

export default function Features() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-indigo-600">
                Features
              </h2>
              <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                Making it easy
              </p>
              <p className="mt-6 text-lg/8 text-gray-600">
                Create and share wishlists for any occasion. Whether it&apos;s
                for birthdays, Christmas, or weddings, we&apos;ve got you
                covered.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon
                        aria-hidden="true"
                        className="absolute left-1 top-1 size-5 text-indigo-600"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <img
            alt="Wishlist app screenshot"
            src="/screenshots/features.png"
            width={2432}
            height={1442}
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  );
}
