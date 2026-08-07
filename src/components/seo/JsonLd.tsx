import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/constants";

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Sakura Web Studio",
      alternateName: SITE_NAME,
      url: SITE_URL,
      email: CONTACT_EMAIL,
      description:
        "Global web design and development studio specializing in branding, UX/UI design, 3D design, and e-commerce.",
      contactPoint: {
        "@type": "ContactPoint",
        email: CONTACT_EMAIL,
        contactType: "sales",
        availableLanguage: ["English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Sakura Web Studio",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
