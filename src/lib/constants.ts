export const SITE_NAME = "sakura.";
export const SITE_TITLE = "Sakura - Web Studio";
export const ACCENT_COLOR = "#ff92e4";
export const CONTACT_EMAIL = "hey@sakura.global";
export const JOBS_EMAIL = "jobs@sakura.global";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sakura.global";

export const NAV_LINKS = [
  { href: "/portfolio", label: "portfolio" },
  { href: "/services", label: "services" },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
] as const;

export const TYPEWRITER_PHRASES = [
  "Sakura is a global agency specializing in branding and UX design.",
  "We create cutting-edge digital experiences for leading global brands.",
  "Dream it. We Build it.",
];

export const ACCORDION_ITEMS = [
  {
    title: "Brand Identity",
    text: "At Sakura, a brand is more than just visuals—it's the story behind them. We craft a unique visual and verbal identity, develop essential brand assets, and establish comprehensive guidelines.",
  },
  {
    title: "Digital Connections",
    text: "Sakura specializes in creating genuine connections by blending aesthetics with behavioral insights. Our senior UI/UX designers develop captivating digital experiences.",
  },
  {
    title: "Flawless Development",
    text: "Our developers turn code into extraordinary experiences. From backend magic to sleek frontend interfaces, we create flawless user journeys across every device.",
  },
  {
    title: "Web Brilliance",
    text: "We craft digital gateways that immerse users in your brand's world. Our websites are vivid reflections of identity, drawing users into unforgettable experiences.",
  },
  {
    title: "AI lovers",
    text: "Sakura is at the forefront of harnessing AI to transform digital interactions, creating cutting-edge interfaces that set the future of digital engagement.",
  },
  {
    title: "Creative Pulse",
    text: "From copywriting to 2D/3D graphics, animation, video production, and photography, we bring your brand's story to life.",
  },
] as const;
