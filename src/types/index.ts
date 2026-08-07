import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
    };
  }
}

export type CaseStudyTextItem = {
  label: string;
  text: string;
};

export type ProjectWithAssets = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  linkType: "CASE_STUDY" | "EXTERNAL";
  externalUrl: string | null;
  logoAsset: { path: string; alt: string | null } | null;
  cardVideoAsset: { path: string } | null;
};
