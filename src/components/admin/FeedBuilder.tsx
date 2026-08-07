"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { reorderFeedItems, deleteFeedItem, createFeedItem, updateFeedItem } from "@/actions";

type FeedItem = {
  id: string;
  itemType: string;
  sortOrder: number;
  projectId?: string | null;
  mediaAssetId?: string | null;
  posterAssetId?: string | null;
  project?: { title: string } | null;
  mediaAsset?: { filename: string } | null;
  posterAsset?: { filename: string } | null;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  feedItems: FeedItem[];
};

interface FeedBuilderProps {
  categories: Category[];
  projects: { id: string; title: string }[];
  mediaAssets: { id: string; filename: string; mediaType: string }[];
}

export function FeedBuilder({ categories: initialCategories, projects, mediaAssets }: FeedBuilderProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [activeCategory, setActiveCategory] = useState(initialCategories[0]?.slug ?? "featured");
  const [saving, setSaving] = useState(false);
  const [addingType, setAddingType] = useState("PROJECT_CARD");
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? "");
  const [selectedMediaAssetId, setSelectedMediaAssetId] = useState(mediaAssets[0]?.id ?? "");
  const [selectedPosterAssetId, setSelectedPosterAssetId] = useState(mediaAssets.find((a) => a.mediaType === "IMAGE")?.id ?? "");

  const currentCategory = categories.find((c) => c.slug === activeCategory);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentCategory) return;

    const items = currentCategory.feedItems;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    setCategories((cats) =>
      cats.map((c) =>
        c.slug === activeCategory ? { ...c, feedItems: reordered } : c
      )
    );

    setSaving(true);
    await reorderFeedItems(currentCategory.id, reordered.map((i) => i.id));
    setSaving(false);
  }

  async function handleAddItem() {
    if (!currentCategory) return;

    const type = addingType;
    const data: Parameters<typeof createFeedItem>[0] = {
      categoryId: currentCategory.id,
      itemType: type,
    };

    if (type === "PROJECT_CARD" && selectedProjectId) {
      data.projectId = selectedProjectId;
    } else if (type !== "PROJECT_CARD" && selectedMediaAssetId) {
      data.mediaAssetId = selectedMediaAssetId;
      if (type === "PLAYABLE_VIDEO" && selectedPosterAssetId) {
        data.posterAssetId = selectedPosterAssetId;
      }
    }

    const result = await createFeedItem(data);
    if (result.success && result.item) {
      setCategories((cats) =>
        cats.map((cat) =>
          cat.id === currentCategory.id
            ? {
                ...cat,
                feedItems: [
                  ...cat.feedItems,
                  {
                    ...result.item,
                    itemType: result.item.itemType,
                    sortOrder: result.item.sortOrder,
                    projectId: result.item.projectId,
                    mediaAssetId: result.item.mediaAssetId,
                    posterAssetId: result.item.posterAssetId,
                    project:
                      result.item.projectId
                        ? { title: projects.find((p) => p.id === result.item.projectId)?.title ?? "Project" }
                        : null,
                    mediaAsset:
                      result.item.mediaAssetId
                        ? { filename: mediaAssets.find((m) => m.id === result.item.mediaAssetId)?.filename ?? "Media" }
                        : null,
                    posterAsset:
                      result.item.posterAssetId
                        ? { filename: mediaAssets.find((m) => m.id === result.item.posterAssetId)?.filename ?? "Poster" }
                        : null,
                  },
                ],
              }
            : cat
        )
      );
    }
  }

  async function handleDelete(id: string) {
    await deleteFeedItem(id);
    setCategories((cats) =>
      cats.map((cat) =>
        cat.id === currentCategory?.id
          ? { ...cat, feedItems: cat.feedItems.filter((item) => item.id !== id) }
          : cat
      )
    );
  }

  async function handleUpdate(
    itemId: string,
    update: { projectId?: string | null; mediaAssetId?: string | null; posterAssetId?: string | null }
  ) {
    const result = await updateFeedItem(itemId, update);
    if (!result.success || !currentCategory) return;

    setCategories((cats) =>
      cats.map((cat) =>
        cat.id !== currentCategory.id
          ? cat
          : {
              ...cat,
              feedItems: cat.feedItems.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      projectId: result.item.projectId,
                      mediaAssetId: result.item.mediaAssetId,
                      posterAssetId: result.item.posterAssetId,
                      project: result.item.project,
                      mediaAsset: result.item.mediaAsset,
                      posterAsset: result.item.posterAsset ?? null,
                    }
                  : item
              ),
            }
      )
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              activeCategory === cat.slug
                ? "bg-[var(--color-accent)] text-black"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded p-4 mb-6 space-y-3">
        <p className="text-sm text-white/70">Add feed item</p>
        <div className="grid md:grid-cols-4 gap-2">
          <select className="admin-input" value={addingType} onChange={(e) => setAddingType(e.target.value)}>
            {["PROJECT_CARD", "IMAGE_BANNER", "VIDEO_BANNER", "PLAYABLE_VIDEO"].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            className="admin-input"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={addingType !== "PROJECT_CARD"}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          <select
            className="admin-input"
            value={selectedMediaAssetId}
            onChange={(e) => setSelectedMediaAssetId(e.target.value)}
            disabled={addingType === "PROJECT_CARD"}
          >
            {mediaAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>{asset.filename}</option>
            ))}
          </select>
          <select
            className="admin-input"
            value={selectedPosterAssetId}
            onChange={(e) => setSelectedPosterAssetId(e.target.value)}
            disabled={addingType !== "PLAYABLE_VIDEO"}
          >
            {mediaAssets
              .filter((asset) => asset.mediaType === "IMAGE")
              .map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.filename}</option>
              ))}
          </select>
        </div>
        <button onClick={handleAddItem} className="admin-btn admin-btn-secondary text-xs">
          + Add Item
        </button>
      </div>

      {saving && <p className="text-sm text-white/50 mb-4">Saving order...</p>}

      {currentCategory && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={currentCategory.feedItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {currentCategory.feedItems.map((item) => (
                <SortableFeedItem
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  projects={projects}
                  mediaAssets={mediaAssets}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableFeedItem({
  item,
  onDelete,
  onUpdate,
  projects,
  mediaAssets,
}: {
  item: FeedItem;
  onDelete: (id: string) => void;
  onUpdate: (
    itemId: string,
    update: { projectId?: string | null; mediaAssetId?: string | null; posterAssetId?: string | null }
  ) => void;
  projects: { id: string; title: string }[];
  mediaAssets: { id: string; filename: string; mediaType: string }[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label =
    item.itemType === "PROJECT_CARD"
      ? item.project?.title ?? "Project"
      : item.mediaAsset?.filename ?? "Media";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between glass-panel px-4 py-3 rounded"
    >
      <div className="flex items-center gap-4">
        <button {...attributes} {...listeners} className="cursor-grab text-white/40 hover:text-white">
          ⠿
        </button>
        <span className="text-xs text-[var(--color-accent)]">{item.itemType}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {item.itemType === "PROJECT_CARD" ? (
          <select
            className="admin-input text-xs !py-1 !px-2"
            value={item.projectId ?? ""}
            onChange={(e) => onUpdate(item.id, { projectId: e.target.value || null })}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
        ) : (
          <>
            <select
              className="admin-input text-xs !py-1 !px-2"
              value={item.mediaAssetId ?? ""}
              onChange={(e) => onUpdate(item.id, { mediaAssetId: e.target.value || null })}
            >
              <option value="">No media</option>
              {mediaAssets.map((media) => (
                <option key={media.id} value={media.id}>{media.filename}</option>
              ))}
            </select>
            {item.itemType === "PLAYABLE_VIDEO" && (
              <select
                className="admin-input text-xs !py-1 !px-2"
                value={item.posterAssetId ?? ""}
                onChange={(e) => onUpdate(item.id, { posterAssetId: e.target.value || null })}
              >
                <option value="">No poster</option>
                {mediaAssets
                  .filter((media) => media.mediaType === "IMAGE")
                  .map((media) => (
                    <option key={media.id} value={media.id}>{media.filename}</option>
                  ))}
              </select>
            )}
          </>
        )}
        <button
          onClick={() => onDelete(item.id)}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
