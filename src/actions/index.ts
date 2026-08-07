"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema, projectSchema, caseStudyBlockSchema } from "@/lib/validations/project";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/constants";
import { storage } from "@/lib/storage";

export async function submitContactForm(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company") || undefined,
    message: formData.get("message"),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, company, message } = parsed.data;

  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL ?? CONTACT_EMAIL;

  if (resendKey) {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "Sakura Contact <onboarding@resend.dev>",
      to: toEmail,
      subject: `Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company ?? "N/A"}\n\n${message}`,
    });
  } else {
    console.log("[Contact Form]", { name, email, company, message });
  }

  return { success: true };
}

export async function saveProject(data: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { id, categoryIds, externalUrl, ...projectData } = parsed.data;

  const project = id
    ? await prisma.project.update({
        where: { id },
        data: {
          ...projectData,
          externalUrl: externalUrl || null,
        },
      })
    : await prisma.project.upsert({
        where: { slug: projectData.slug },
        create: {
          ...projectData,
          externalUrl: externalUrl || null,
        },
        update: {
          ...projectData,
          externalUrl: externalUrl || null,
        },
      });

  await prisma.projectCategory.deleteMany({ where: { projectId: project.id } });
  if (categoryIds.length > 0) {
    await prisma.projectCategory.createMany({
      data: categoryIds.map((categoryId) => ({
        projectId: project.id,
        categoryId,
      })),
    });
  }

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${project.slug}`);
  revalidatePath("/admin/projects");

  return { success: true, project };
}

export async function deleteProject(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
  revalidatePath("/portfolio");
  return { success: true };
}

export async function saveCaseStudyBlocks(
  projectId: string,
  blocks: unknown[]
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.caseStudyBlock.deleteMany({ where: { projectId } });

  for (const block of blocks) {
    const parsed = caseStudyBlockSchema.safeParse(block);
    if (parsed.success) {
      await prisma.caseStudyBlock.create({
        data: { ...parsed.data, projectId },
      });
    }
  }

  revalidatePath("/portfolio");
  return { success: true };
}

export async function reorderFeedItems(
  categoryId: string,
  itemIds: string[]
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await Promise.all(
    itemIds.map((id, index) =>
      prisma.portfolioFeedItem.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath("/portfolio");
  return { success: true };
}

export async function createFeedItem(data: {
  categoryId: string;
  itemType: string;
  projectId?: string;
  mediaAssetId?: string;
  posterAssetId?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const maxOrder = await prisma.portfolioFeedItem.aggregate({
    where: { categoryId: data.categoryId },
    _max: { sortOrder: true },
  });

  const item = await prisma.portfolioFeedItem.create({
    data: {
      categoryId: data.categoryId,
      itemType: data.itemType as "PROJECT_CARD" | "IMAGE_BANNER" | "VIDEO_BANNER" | "PLAYABLE_VIDEO",
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      projectId: data.projectId ?? null,
      mediaAssetId: data.mediaAssetId ?? null,
      posterAssetId: data.posterAssetId ?? null,
    },
  });

  revalidatePath("/portfolio");
  revalidatePath("/admin/feed");
  return { success: true, item };
}

export async function updateFeedItem(
  id: string,
  data: {
    projectId?: string | null;
    mediaAssetId?: string | null;
    posterAssetId?: string | null;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const item = await prisma.portfolioFeedItem.update({
    where: { id },
    data: {
      projectId: data.projectId ?? null,
      mediaAssetId: data.mediaAssetId ?? null,
      posterAssetId: data.posterAssetId ?? null,
    },
    include: {
      project: { select: { title: true } },
      mediaAsset: { select: { filename: true } },
      posterAsset: { select: { filename: true } },
    },
  });

  revalidatePath("/portfolio");
  revalidatePath("/admin/feed");
  return { success: true, item };
}

export async function deleteFeedItem(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.portfolioFeedItem.delete({ where: { id } });
  revalidatePath("/portfolio");
  revalidatePath("/admin/feed");
  return { success: true };
}

export async function deleteMediaAsset(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const inUseCount =
    (await prisma.project.count({
      where: {
        OR: [{ logoAssetId: id }, { cardVideoAssetId: id }],
      },
    })) +
    (await prisma.caseStudyBlock.count({ where: { imageAssetId: id } })) +
    (await prisma.portfolioFeedItem.count({
      where: {
        OR: [{ mediaAssetId: id }, { posterAssetId: id }],
      },
    }));

  if (inUseCount > 0) {
    return {
      success: false,
      message: "Asset is used in projects/feed/case studies and cannot be deleted.",
    };
  }

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return { success: false, message: "Asset not found." };
  }

  await prisma.mediaAsset.delete({ where: { id } });
  await storage.delete(asset.path);
  revalidatePath("/admin/media");
  return { success: true };
}

export async function getFeaturedProjects() {
  return prisma.project.findMany({
    where: { homeFeatured: true, status: "PUBLISHED" },
    orderBy: { homeSortOrder: "asc" },
    include: {
      logoAsset: true,
      cardVideoAsset: true,
    },
  });
}

export async function getCategoriesWithFeed() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      feedItems: {
        orderBy: { sortOrder: "asc" },
        include: {
          project: {
            include: { logoAsset: true, cardVideoAsset: true },
          },
          mediaAsset: true,
          posterAsset: true,
        },
      },
    },
  });
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      logoAsset: true,
      cardVideoAsset: true,
      caseStudyBlocks: {
        orderBy: { sortOrder: "asc" },
        include: { imageAsset: true },
      },
      categories: { include: { category: true } },
    },
  });
}
