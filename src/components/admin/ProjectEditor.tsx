"use client";

import { useMemo, useState } from "react";
import { saveCaseStudyBlocks, saveProject } from "@/actions";

type Category = { id: string; slug: string; name: string };
type MediaAsset = { id: string; path: string; filename: string; mediaType: string };

type CaseStudyBlock = {
  id?: string;
  blockType: "IMAGE" | "TEXT_SECTION";
  sortOrder: number;
  title?: string | null;
  content?: string | null;
  imageAssetId?: string | null;
};
type CaseStudyBullet = { label: string; text: string };
type EditableCaseStudyBlock = Omit<CaseStudyBlock, "content"> & {
  content: CaseStudyBullet[];
};

type Project = {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  status: "DRAFT" | "PUBLISHED";
  linkType: "CASE_STUDY" | "EXTERNAL";
  externalUrl?: string | null;
  logoAssetId?: string | null;
  cardVideoAssetId?: string | null;
  homeFeatured: boolean;
  homeSortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  caseStudyTitle?: string | null;
  caseStudySubtitle?: string | null;
  categories?: { categoryId: string }[];
  caseStudyBlocks?: CaseStudyBlock[];
};

interface ProjectEditorProps {
  project?: Project;
  categories: Category[];
  mediaAssets: MediaAsset[];
}

const TABS = ["general", "card", "home", "case study", "seo"] as const;

function parseTextItems(content?: string | null): Array<{ label: string; text: string }> {
  if (!content) return [{ label: "", text: "" }];
  try {
    const parsed = JSON.parse(content) as Array<{ label?: string; text?: string }>;
    if (!Array.isArray(parsed) || parsed.length === 0) return [{ label: "", text: "" }];
    return parsed.map((item) => ({ label: item.label ?? "", text: item.text ?? "" }));
  } catch {
    return [{ label: "", text: "" }];
  }
}

export function ProjectEditor({ project, categories, mediaAssets }: ProjectEditorProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("general");
  const [form, setForm] = useState({
    id: project?.id,
    slug: project?.slug ?? "",
    title: project?.title ?? "",
    subtitle: project?.subtitle ?? "",
    status: (project?.status ?? "DRAFT") as "DRAFT" | "PUBLISHED",
    linkType: (project?.linkType ?? "EXTERNAL") as "CASE_STUDY" | "EXTERNAL",
    externalUrl: project?.externalUrl ?? "",
    logoAssetId: project?.logoAssetId ?? "",
    cardVideoAssetId: project?.cardVideoAssetId ?? "",
    homeFeatured: project?.homeFeatured ?? false,
    homeSortOrder: project?.homeSortOrder ?? 0,
    seoTitle: project?.seoTitle ?? "",
    seoDescription: project?.seoDescription ?? "",
    caseStudyTitle: project?.caseStudyTitle ?? "",
    caseStudySubtitle: project?.caseStudySubtitle ?? "",
    categoryIds: project?.categories?.map((c) => c.categoryId) ?? [],
  });

  const [blocks, setBlocks] = useState<EditableCaseStudyBlock[]>(() =>
    (project?.caseStudyBlocks ?? []).map((block, index) => ({
      id: block.id,
      blockType: block.blockType,
      sortOrder: index,
      title: block.title ?? "",
      content: parseTextItems(block.content),
      imageAssetId: block.imageAssetId ?? "",
    }))
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const images = useMemo(() => mediaAssets.filter((a) => a.mediaType === "IMAGE"), [mediaAssets]);
  const videos = useMemo(() => mediaAssets.filter((a) => a.mediaType === "VIDEO"), [mediaAssets]);

  function normalizeBlocks() {
    return blocks.map((block, index) => ({
      blockType: block.blockType,
      sortOrder: index,
      title: block.blockType === "TEXT_SECTION" ? (block.title || null) : null,
      content:
        block.blockType === "TEXT_SECTION"
          ? JSON.stringify(block.content.filter((item) => item.label.trim() || item.text.trim()))
          : null,
      imageAssetId: block.blockType === "IMAGE" ? (block.imageAssetId || null) : null,
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const projectResult = await saveProject({
      ...form,
      logoAssetId: form.logoAssetId || null,
      cardVideoAssetId: form.cardVideoAssetId || null,
      externalUrl: form.externalUrl || null,
    });

    if (!projectResult.success) {
      setSaving(false);
      setMessage("Validation error - check fields");
      return;
    }

    if (form.linkType === "CASE_STUDY" && projectResult.project?.id) {
      await saveCaseStudyBlocks(projectResult.project.id, normalizeBlocks());
    }

    setSaving(false);
    setMessage("Saved successfully");
  }

  function addBlock(type: "IMAGE" | "TEXT_SECTION") {
    setBlocks((prev) => [
      ...prev,
      {
        blockType: type,
        sortOrder: prev.length,
        title: "",
        content: [{ label: "", text: "" }],
        imageAssetId: "",
      },
    ]);
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copied = [...prev];
      const [item] = copied.splice(index, 1);
      copied.splice(nextIndex, 0, item);
      return copied;
    });
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6 border-b border-white/10 pb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize pb-2 border-b-2 transition-colors ${
              activeTab === tab
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-transparent hover:text-[var(--color-accent)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-w-3xl">
        {activeTab === "general" && (
          <>
            <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Field label="Subtitle" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} />
            <SelectField
              label="Status"
              value={form.status}
              options={["DRAFT", "PUBLISHED"]}
              onChange={(v) => setForm({ ...form, status: v as "DRAFT" | "PUBLISHED" })}
            />
            <SelectField
              label="Link Type"
              value={form.linkType}
              options={["CASE_STUDY", "EXTERNAL"]}
              onChange={(v) => setForm({ ...form, linkType: v as "CASE_STUDY" | "EXTERNAL" })}
            />
            {form.linkType === "EXTERNAL" && (
              <Field label="External URL" value={form.externalUrl} onChange={(v) => setForm({ ...form, externalUrl: v })} />
            )}
            <div>
              <label className="block text-sm text-white/60 mb-2">Categories</label>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.categoryIds.includes(cat.id)}
                      onChange={(e) => {
                        const ids = e.target.checked
                          ? [...form.categoryIds, cat.id]
                          : form.categoryIds.filter((id) => id !== cat.id);
                        setForm({ ...form, categoryIds: ids });
                      }}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "card" && (
          <>
            <AssetSelect
              label="Logo"
              value={form.logoAssetId}
              assets={images}
              onChange={(v) => setForm({ ...form, logoAssetId: v })}
            />
            <AssetSelect
              label="Card Video"
              value={form.cardVideoAssetId}
              assets={videos}
              onChange={(v) => setForm({ ...form, cardVideoAssetId: v })}
            />
          </>
        )}

        {activeTab === "home" && (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.homeFeatured}
                onChange={(e) => setForm({ ...form, homeFeatured: e.target.checked })}
              />
              Featured on Home
            </label>
            <Field
              label="Home Sort Order"
              value={String(form.homeSortOrder)}
              onChange={(v) => setForm({ ...form, homeSortOrder: parseInt(v, 10) || 0 })}
            />
          </>
        )}

        {activeTab === "case study" && (
          <>
            <Field label="Case Study Title" value={form.caseStudyTitle} onChange={(v) => setForm({ ...form, caseStudyTitle: v })} />
            <Field label="Case Study Subtitle" value={form.caseStudySubtitle} onChange={(v) => setForm({ ...form, caseStudySubtitle: v })} />

            <div className="flex gap-3 pt-2">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => addBlock("TEXT_SECTION")}>
                + Text section
              </button>
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => addBlock("IMAGE")}>
                + Image block
              </button>
            </div>

            <div className="space-y-4">
              {blocks.map((block, index) => (
                <div key={`${block.id ?? "new"}-${index}`} className="glass-panel rounded p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-accent)]">{block.blockType}</span>
                    <div className="flex gap-2">
                      <button type="button" className="admin-btn admin-btn-secondary" onClick={() => moveBlock(index, -1)}>
                        ^
                      </button>
                      <button type="button" className="admin-btn admin-btn-secondary" onClick={() => moveBlock(index, 1)}>
                        v
                      </button>
                      <button type="button" className="admin-btn admin-btn-secondary" onClick={() => removeBlock(index)}>
                        Remove
                      </button>
                    </div>
                  </div>

                  {block.blockType === "IMAGE" ? (
                    <AssetSelect
                      label="Image"
                      value={block.imageAssetId ?? ""}
                      assets={images}
                      onChange={(v) =>
                        setBlocks((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], imageAssetId: v };
                          return next;
                        })
                      }
                    />
                  ) : (
                    <>
                      <Field
                        label="Section title"
                        value={block.title ?? ""}
                        onChange={(v) =>
                          setBlocks((prev) => {
                            const next = [...prev];
                            next[index] = { ...next[index], title: v };
                            return next;
                          })
                        }
                      />

                      <div className="space-y-2">
                        <label className="block text-sm text-white/60">Bullets</label>
                        {(block.content ?? []).map((item, itemIndex) => (
                          <div key={itemIndex} className="grid md:grid-cols-2 gap-2">
                            <input
                              className="admin-input"
                              placeholder="Label"
                              value={item.label}
                              onChange={(e) =>
                                setBlocks((prev) => {
                                  const next = [...prev];
                                  const content = [...(next[index].content ?? [])];
                                  content[itemIndex] = { ...content[itemIndex], label: e.target.value };
                                  next[index] = { ...next[index], content };
                                  return next;
                                })
                              }
                            />
                            <input
                              className="admin-input"
                              placeholder="Text"
                              value={item.text}
                              onChange={(e) =>
                                setBlocks((prev) => {
                                  const next = [...prev];
                                  const content = [...(next[index].content ?? [])];
                                  content[itemIndex] = { ...content[itemIndex], text: e.target.value };
                                  next[index] = { ...next[index], content };
                                  return next;
                                })
                              }
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary"
                          onClick={() =>
                            setBlocks((prev) => {
                              const next = [...prev];
                              const content = [...(next[index].content ?? []), { label: "", text: "" }];
                              next[index] = { ...next[index], content };
                              return next;
                            })
                          }
                        >
                          + Bullet
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "seo" && (
          <>
            <Field label="SEO Title" value={form.seoTitle} onChange={(v) => setForm({ ...form, seoTitle: v })} />
            <Field label="SEO Description" value={form.seoDescription} onChange={(v) => setForm({ ...form, seoDescription: v })} />
          </>
        )}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button onClick={handleSave} disabled={saving} className="admin-btn">
          {saving ? "Saving..." : "Save Project"}
        </button>
        {message && <span className="text-sm text-white/60">{message}</span>}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1">{label}</label>
      <input className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1">{label}</label>
      <select className="admin-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function AssetSelect({
  label,
  value,
  assets,
  onChange,
}: {
  label: string;
  value: string;
  assets: MediaAsset[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1">{label}</label>
      <select className="admin-input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">None</option>
        {assets.map((a) => (
          <option key={a.id} value={a.id}>{a.filename}</option>
        ))}
      </select>
    </div>
  );
}
