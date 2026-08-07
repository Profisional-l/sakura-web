import { z } from "zod";

export const projectSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  linkType: z.enum(["CASE_STUDY", "EXTERNAL"]),
  externalUrl: z.string().url().optional().nullable().or(z.literal("")),
  logoAssetId: z.string().optional().nullable(),
  cardVideoAssetId: z.string().optional().nullable(),
  homeFeatured: z.boolean().default(false),
  homeSortOrder: z.number().int().default(0),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  caseStudyTitle: z.string().optional().nullable(),
  caseStudySubtitle: z.string().optional().nullable(),
  categoryIds: z.array(z.string()).default([]),
}).superRefine((data, ctx) => {
  if (data.linkType === "EXTERNAL" && !data.externalUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "External URL is required for EXTERNAL link type",
      path: ["externalUrl"],
    });
  }
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export const caseStudyBlockSchema = z.object({
  blockType: z.enum(["IMAGE", "TEXT_SECTION"]),
  sortOrder: z.number().int(),
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  imageAssetId: z.string().optional().nullable(),
});

export const feedItemSchema = z.object({
  categoryId: z.string(),
  itemType: z.enum(["PROJECT_CARD", "IMAGE_BANNER", "VIDEO_BANNER", "PLAYABLE_VIDEO"]),
  sortOrder: z.number().int(),
  projectId: z.string().optional().nullable(),
  mediaAssetId: z.string().optional().nullable(),
  posterAssetId: z.string().optional().nullable(),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginFormData = z.infer<typeof loginSchema>;
