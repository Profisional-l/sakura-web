import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createMedia(
  filename: string,
  path: string,
  mimeType: string,
  mediaType: "IMAGE" | "VIDEO",
  alt?: string
) {
  return prisma.mediaAsset.create({
    data: { filename, path, mimeType, mediaType, alt },
  });
}

async function main() {
  await prisma.portfolioFeedItem.deleteMany();
  await prisma.caseStudyBlock.deleteMany();
  await prisma.projectCategory.deleteMany();
  await prisma.project.deleteMany();
  await prisma.category.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.adminUser.deleteMany();

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@sakura.global";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "sakura-admin";
  await prisma.adminUser.create({
    data: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: "Sakura Admin",
    },
  });

  const categories = await Promise.all([
    prisma.category.create({ data: { slug: "featured", name: "Featured", sortOrder: 0 } }),
    prisma.category.create({ data: { slug: "digital", name: "Digital Products", sortOrder: 1 } }),
    prisma.category.create({ data: { slug: "websites", name: "Websites", sortOrder: 2 } }),
    prisma.category.create({ data: { slug: "branding", name: "Branding", sortOrder: 3 } }),
  ]);
  const [featured, digital, websites, branding] = categories;

  const logos = {
    dala: await createMedia("dala-d.webp", "/media/logos/dala-d.webp", "image/webp", "IMAGE", "Dala"),
    contra: await createMedia("contraLogo.webp", "/media/logos/contraLogo.webp", "image/webp", "IMAGE", "Contra"),
    pulltail: await createMedia("pulltail-logo.webp", "/media/logos/pulltail-logo.webp", "image/webp", "IMAGE", "Pulltail"),
    peptone: await createMedia("Peptone_logo.webp", "/media/logos/Peptone_logo.webp", "image/webp", "IMAGE", "Peptone"),
    jessica: await createMedia("JessicoLOGO.webp", "/media/logos/JessicoLOGO.webp", "image/webp", "IMAGE", "Jessica Mille"),
    hrpd: await createMedia("HRPDlogo.webp", "/media/logos/HRPDlogo.webp", "image/webp", "IMAGE", "HRPD"),
  };

  const videos = {
    dala: await createMedia("outDALA.mp4", "/media/videos/outDALA.mp4", "video/mp4", "VIDEO"),
    contra: await createMedia("outContra.mp4", "/media/videos/outContra.mp4", "video/mp4", "VIDEO"),
    pulltail: await createMedia("pulltailOutVideo.mp4", "/media/videos/pulltailOutVideo.mp4", "video/mp4", "VIDEO"),
    peptone: await createMedia("peptoneOUT.mp4", "/media/videos/peptoneOUT.mp4", "video/mp4", "VIDEO"),
    jessica: await createMedia("outJessicaMvideo.mp4", "/media/videos/outJessicaMvideo.mp4", "video/mp4", "VIDEO"),
    hrpd: await createMedia("HRPDoutVIDEO.mp4", "/media/videos/HRPDoutVIDEO.mp4", "video/mp4", "VIDEO"),
    hero: await createMedia("SakuraOutFin.mp4", "/media/videos/SakuraOutFin.mp4", "video/mp4", "VIDEO"),
    sakuraStory: await createMedia("Gallery-26_1.mp4", "/media/videos/Gallery-26_1.mp4", "video/mp4", "VIDEO"),
    design01: await createMedia("design01.mp4", "/media/portfolio/design01.mp4", "video/mp4", "VIDEO"),
    design06: await createMedia("design06.mp4", "/media/portfolio/design06.mp4", "video/mp4", "VIDEO"),
    banner3d: await createMedia("3d_video01.mp4", "/media/portfolio/3d_video01.mp4", "video/mp4", "VIDEO"),
  };

  const images = {
    preview01: await createMedia("preview01.webp", "/media/portfolio/preview01.webp", "image/webp", "IMAGE"),
    preview06: await createMedia("preview06.webp", "/media/portfolio/preview06.webp", "image/webp", "IMAGE"),
    boots01: await createMedia("boots01.jpg", "/media/portfolio/boots01.jpg", "image/jpeg", "IMAGE"),
    tin01: await createMedia("tin01.jpg", "/media/portfolio/tin01.jpg", "image/jpeg", "IMAGE"),
    seelkad: await createMedia("seelkad.png", "/media/portfolio/seelkad.png", "image/png", "IMAGE"),
    duchi03: await createMedia("duchi03.jpg", "/media/portfolio/duchi03.jpg", "image/jpeg", "IMAGE"),
    duchi01: await createMedia("duchi01.jpg", "/media/portfolio/duchi01.jpg", "image/jpeg", "IMAGE"),
    jma1: await createMedia("jma1.png", "/media/portfolio/jma1.png", "image/png", "IMAGE"),
    jma2: await createMedia("jma2.png", "/media/portfolio/jma2.png", "image/png", "IMAGE"),
    jma3: await createMedia("jma3.png", "/media/portfolio/jma3.png", "image/png", "IMAGE"),
    jma4: await createMedia("jma4.png", "/media/portfolio/jma4.png", "image/png", "IMAGE"),
    contra1: await createMedia("contra1.png", "/media/portfolio/contra1.png", "image/png", "IMAGE"),
    contra2: await createMedia("contra2.png", "/media/portfolio/contra2.png", "image/png", "IMAGE"),
    contra3: await createMedia("contra3.png", "/media/portfolio/contra3.png", "image/png", "IMAGE"),
  };

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        slug: "dala",
        title: "Dala Technologies Limited",
        subtitle: "Modern design-focused digital presence",
        status: "PUBLISHED",
        linkType: "CASE_STUDY",
        logoAssetId: logos.dala.id,
        cardVideoAssetId: videos.dala.id,
        homeFeatured: true,
        homeSortOrder: 1,
        caseStudyTitle: "Dala Technologies Limited",
        caseStudySubtitle:
          "Creating a website like Dala involved a comprehensive process that balanced creative vision with technical precision.",
        seoTitle: "Dala Technologies | Sakura Portfolio",
        seoDescription: "Case study: Dala Technologies website design and development by Sakura.",
      },
    }),
    prisma.project.create({
      data: {
        slug: "contra",
        title: "Contra",
        subtitle: "Freelancer marketplace platform",
        status: "PUBLISHED",
        linkType: "CASE_STUDY",
        logoAssetId: logos.contra.id,
        cardVideoAssetId: videos.contra.id,
        homeFeatured: true,
        homeSortOrder: 0,
        caseStudyTitle: "Contra",
        caseStudySubtitle:
          "Creating a website like Contra required strategic planning, cutting-edge design, and advanced development.",
        seoTitle: "Contra | Sakura Portfolio",
        seoDescription: "Case study: Contra platform design by Sakura.",
      },
    }),
    prisma.project.create({
      data: {
        slug: "pulltail",
        title: "Pulltail",
        subtitle: "Brand and digital experience",
        status: "PUBLISHED",
        linkType: "EXTERNAL",
        externalUrl: "https://pulltail.com/",
        logoAssetId: logos.pulltail.id,
        cardVideoAssetId: videos.pulltail.id,
        homeFeatured: true,
        homeSortOrder: 2,
        seoTitle: "Pulltail | Sakura Portfolio",
      },
    }),
    prisma.project.create({
      data: {
        slug: "peptone",
        title: "Peptone",
        subtitle: "Biotech digital platform",
        status: "PUBLISHED",
        linkType: "EXTERNAL",
        externalUrl: "https://peptone.io/",
        logoAssetId: logos.peptone.id,
        cardVideoAssetId: videos.peptone.id,
        homeFeatured: true,
        homeSortOrder: 3,
        seoTitle: "Peptone | Sakura Portfolio",
      },
    }),
    prisma.project.create({
      data: {
        slug: "jessica-mille",
        title: "Jessica Mille Architecte",
        subtitle: "Architectural portfolio website",
        status: "PUBLISHED",
        linkType: "CASE_STUDY",
        logoAssetId: logos.jessica.id,
        cardVideoAssetId: videos.jessica.id,
        homeFeatured: true,
        homeSortOrder: 4,
        caseStudyTitle: "Jessica Mille Architecte",
        caseStudySubtitle:
          "Creating a website for an architectural firm involves several key stages addressing technical and creative challenges.",
        seoTitle: "Jessica Mille Architecte | Sakura Portfolio",
      },
    }),
    prisma.project.create({
      data: {
        slug: "hrpd",
        title: "High Risk Pregnancy Doctors",
        subtitle: "Healthcare digital platform",
        status: "PUBLISHED",
        linkType: "EXTERNAL",
        externalUrl: "https://highrisk-pregnancy.com/",
        logoAssetId: logos.hrpd.id,
        cardVideoAssetId: videos.hrpd.id,
        homeFeatured: true,
        homeSortOrder: 5,
        seoTitle: "HRPD | Sakura Portfolio",
      },
    }),
  ]);

  const [dala, contra, pulltail, peptone, jessica, hrpd] = projects;

  const catLinks = [
    { projectId: dala.id, categoryId: featured.id },
    { projectId: contra.id, categoryId: featured.id },
    { projectId: pulltail.id, categoryId: featured.id },
    { projectId: jessica.id, categoryId: featured.id },
    { projectId: dala.id, categoryId: websites.id },
    { projectId: contra.id, categoryId: websites.id },
    { projectId: peptone.id, categoryId: websites.id },
    { projectId: hrpd.id, categoryId: websites.id },
    { projectId: jessica.id, categoryId: websites.id },
    { projectId: pulltail.id, categoryId: digital.id },
    { projectId: contra.id, categoryId: branding.id },
  ];
  await prisma.projectCategory.createMany({ data: catLinks });

  // Dala case study blocks
  await prisma.caseStudyBlock.createMany({
    data: [
      {
        projectId: dala.id,
        blockType: "IMAGE",
        sortOrder: 0,
        imageAssetId: images.jma4.id,
      },
      {
        projectId: dala.id,
        blockType: "TEXT_SECTION",
        sortOrder: 1,
        title: "Initial Consultation and Research",
        content: JSON.stringify([
          { label: "Client Briefing", text: "Detailed discussions with the Dala team to understand brand identity, objectives, and target audience." },
          { label: "Market Analysis", text: "Research on industry trends and competitor websites to identify key differentiators." },
        ]),
      },
      {
        projectId: dala.id,
        blockType: "IMAGE",
        sortOrder: 2,
        imageAssetId: images.jma2.id,
      },
      {
        projectId: dala.id,
        blockType: "TEXT_SECTION",
        sortOrder: 3,
        title: "Conceptualization and Design",
        content: JSON.stringify([
          { label: "Wireframing", text: "Created wireframes outlining structure with clean, visually engaging layouts." },
          { label: "Visual Design", text: "Restrained color palette, elegant typography, and emphasis on whitespace." },
        ]),
      },
      {
        projectId: dala.id,
        blockType: "IMAGE",
        sortOrder: 4,
        imageAssetId: images.jma1.id,
      },
      {
        projectId: dala.id,
        blockType: "TEXT_SECTION",
        sortOrder: 5,
        title: "Development",
        content: JSON.stringify([
          { label: "Frontend", text: "Responsive development with smooth animations and transitions." },
          { label: "Backend", text: "Custom CMS for easy content updates without technical expertise." },
        ]),
      },
    ],
  });

  // Contra case study blocks
  await prisma.caseStudyBlock.createMany({
    data: [
      { projectId: contra.id, blockType: "IMAGE", sortOrder: 0, imageAssetId: images.contra1.id },
      {
        projectId: contra.id,
        blockType: "TEXT_SECTION",
        sortOrder: 1,
        title: "Discovery and Strategy",
        content: JSON.stringify([
          { label: "Client Consultation", text: "Detailed discussions to understand vision, values, and platform goals." },
          { label: "Market Research", text: "Analyzed user needs and competitors to create a community-driven platform." },
        ]),
      },
      { projectId: contra.id, blockType: "IMAGE", sortOrder: 2, imageAssetId: images.contra2.id },
      {
        projectId: contra.id,
        blockType: "TEXT_SECTION",
        sortOrder: 3,
        title: "UX and Design",
        content: JSON.stringify([
          { label: "Wireframes", text: "Mapped user journeys with dual interfaces for freelancers and clients." },
          { label: "Prototyping", text: "Minimalist interface highlighting community interaction and collaboration." },
        ]),
      },
      { projectId: contra.id, blockType: "IMAGE", sortOrder: 4, imageAssetId: images.contra3.id },
    ],
  });

  // Jessica Mille case study blocks
  await prisma.caseStudyBlock.createMany({
    data: [
      { projectId: jessica.id, blockType: "IMAGE", sortOrder: 0, imageAssetId: images.jma4.id },
      {
        projectId: jessica.id,
        blockType: "TEXT_SECTION",
        sortOrder: 1,
        title: "Requirements Analysis",
        content: JSON.stringify([
          { label: "Client Discussion", text: "Understanding brand, work style, target audience, and functionality requirements." },
          { label: "Market Research", text: "Analyzing competitors and trends in architectural website design." },
        ]),
      },
      { projectId: jessica.id, blockType: "IMAGE", sortOrder: 2, imageAssetId: images.jma2.id },
      {
        projectId: jessica.id,
        blockType: "TEXT_SECTION",
        sortOrder: 3,
        title: "Concept Development",
        content: JSON.stringify([
          { label: "Wireframes", text: "Draft layouts determining content placement and user pathways." },
          { label: "UI/UX Design", text: "Minimalist modern design emphasizing project images and galleries." },
        ]),
      },
      { projectId: jessica.id, blockType: "IMAGE", sortOrder: 4, imageAssetId: images.jma1.id },
      {
        projectId: jessica.id,
        blockType: "TEXT_SECTION",
        sortOrder: 5,
        title: "Launch and Support",
        content: JSON.stringify([
          { label: "Website Launch", text: "Deployed with performance optimization and SEO." },
          { label: "Support", text: "Ongoing maintenance, updates, and feature additions." },
        ]),
      },
    ],
  });

  // Featured feed items
  await prisma.portfolioFeedItem.createMany({
    data: [
      { categoryId: featured.id, itemType: "PLAYABLE_VIDEO", sortOrder: 0, mediaAssetId: videos.design01.id, posterAssetId: images.preview01.id },
      { categoryId: featured.id, itemType: "PLAYABLE_VIDEO", sortOrder: 1, mediaAssetId: videos.design06.id, posterAssetId: images.preview06.id },
      { categoryId: featured.id, itemType: "PROJECT_CARD", sortOrder: 2, projectId: jessica.id },
      { categoryId: featured.id, itemType: "PROJECT_CARD", sortOrder: 3, projectId: dala.id },
      { categoryId: featured.id, itemType: "PROJECT_CARD", sortOrder: 4, projectId: pulltail.id },
      { categoryId: featured.id, itemType: "VIDEO_BANNER", sortOrder: 5, mediaAssetId: videos.banner3d.id },
      { categoryId: featured.id, itemType: "IMAGE_BANNER", sortOrder: 6, mediaAssetId: images.boots01.id },
      { categoryId: featured.id, itemType: "IMAGE_BANNER", sortOrder: 7, mediaAssetId: images.tin01.id },
      { categoryId: featured.id, itemType: "IMAGE_BANNER", sortOrder: 8, mediaAssetId: images.seelkad.id },
      { categoryId: featured.id, itemType: "IMAGE_BANNER", sortOrder: 9, mediaAssetId: images.duchi03.id },
      { categoryId: featured.id, itemType: "IMAGE_BANNER", sortOrder: 10, mediaAssetId: images.duchi01.id },
      { categoryId: digital.id, itemType: "IMAGE_BANNER", sortOrder: 0, mediaAssetId: images.seelkad.id },
      { categoryId: websites.id, itemType: "PROJECT_CARD", sortOrder: 0, projectId: contra.id },
      { categoryId: websites.id, itemType: "PROJECT_CARD", sortOrder: 1, projectId: peptone.id },
      { categoryId: websites.id, itemType: "PROJECT_CARD", sortOrder: 2, projectId: hrpd.id },
      { categoryId: branding.id, itemType: "IMAGE_BANNER", sortOrder: 0, mediaAssetId: images.boots01.id },
      { categoryId: branding.id, itemType: "IMAGE_BANNER", sortOrder: 1, mediaAssetId: images.tin01.id },
    ],
  });

  console.log("Seed completed successfully");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
