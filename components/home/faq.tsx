import Image from "next/image";

import backgroundImage from "@/public/background-faqs.jpg";

export const faqs = [
  [
    {
      question: "Is this service really free?",
      answer:
        "Yes! Our wishlist service is completely free to use. Create as many wishlists as you want and share them with anyone.",
    },
    {
      question: "Can I create multiple wishlists?",
      answer:
        "Absolutely! You can create separate wishlists for different occasions like birthdays, holidays, or any special event.",
    },
    {
      question: "How do I share my wishlist?",
      answer:
        "Simply click the share button on your wishlist and you'll get a link that you can send to friends and family. They can view your wishes without needing an account.",
    },
  ],
  [
    {
      question: "Can people see who reserved what?",
      answer:
        "If you're logged in and viewing your own wishlist through the shared link, we'll warn you that you might see who reserved your gifts. To keep the surprise, view your wishlists through your dashboard instead!",
    },
    {
      question: "What happens when someone reserves an item?",
      answer:
        "When someone reserves an item, they enter their name and the item becomes marked as reserved. This helps prevent duplicate gifts.",
    },
    {
      question: "Can I edit my wishlist after sharing it?",
      answer:
        "Yes, you can add, remove, or edit items even after sharing your wishlist. The shared link will always show the most up-to-date version.",
    },
  ],
  [
    {
      question: "Can I add items from any website?",
      answer:
        "Yes! You can add items from any online store by copying the URL. You can also add custom items without links for things you'd like to receive.",
    },
    {
      question: "How do I organize my wishlist?",
      answer:
        "You can drag and drop items to reorder them however you like. Put your most wanted items at the top or organize them by category.",
    },
    {
      question: "Do I need an account to view someone's wishlist?",
      answer:
        "No, you don't need an account to view a shared wishlist or reserve items. You only need an account to create and manage your own wishlists.",
    },
  ],
];

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

export function Faqs() {
  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section
        id="faq"
        aria-labelledby="faq-title"
        className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
      >
        <Image
          className="absolute left-1/2 top-0 max-w-none -translate-y-1/4 translate-x-[-30%]"
          src={backgroundImage}
          alt=""
          width={1558}
          height={946}
          unoptimized
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2
              id="faq-title"
              className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
            >
              Frequently asked questions
            </h2>
            <p className="mt-4 text-xl tracking-tight text-slate-700">
              If you can’t find what you’re looking for, email our support team
              and if you’re lucky someone will get back to you.
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
          >
            {faqs.map((column, columnIndex) => (
              <li key={columnIndex}>
                <ul role="list" className="flex flex-col gap-y-8">
                  {column.map((faq, faqIndex) => (
                    <li key={faqIndex}>
                      <h3 className="font-display text-lg leading-7 text-slate-900">
                        {faq.question}
                      </h3>
                      <p className="mt-4 text-base text-slate-700">
                        {faq.answer}
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </section>
  );
}
