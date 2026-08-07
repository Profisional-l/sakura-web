"use client";

import { useState } from "react";
import { PortfolioTabs, FeedRenderer } from "@/components/portfolio/FeedRenderer";

type Category = {
  slug: string;
  name: string;
  feedItems: Parameters<typeof FeedRenderer>[0]["items"];
};

export function PortfolioClient({ categories }: { categories: Category[] }) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? "featured");
  const activeCategory = categories.find((c) => c.slug === activeSlug);

  return (
    <>
      <PortfolioTabs
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        activeSlug={activeSlug}
        onTabChange={setActiveSlug}
      />
      {activeCategory && <FeedRenderer key={activeSlug} items={activeCategory.feedItems} />}
    </>
  );
}
