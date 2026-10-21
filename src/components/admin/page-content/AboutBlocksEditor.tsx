import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAboutBlocks } from "@/hooks/useAboutBlocks";
import { errorMessage } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import type { AboutBlock } from "@/types/api";
import { ConfirmDelete, IconAction, Panel, StatusBadge } from "../AdminUI";

interface BlockFormData {
  title: string;
  content: string;
  is_visible: boolean;
}

const EMPTY_FORM: BlockFormData = { title: "", content: "", is_visible: true };

/** Title, text and visibility of one section, for a new or existing one. */
const BlockForm = ({
  idPrefix,
  data,
  onChange,
  onSave,
  onCancel,
  saving,
  saveLabel,
}: {
  idPrefix: string;
  data: BlockFormData;
  onChange: (data: BlockFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  saveLabel: string;
}) => (
  <form
    className="space-y-5"
    onSubmit={(e) => {
      e.preventDefault();
      onSave();
    }}
  >
    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-title`}>Title</Label>
      <Input
        id={`${idPrefix}-title`}
        value={data.title}
        maxLength={255}
        required
        autoFocus
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-content`}>Text</Label>
      <Textarea
        id={`${idPrefix}-content`}
        value={data.content}
        rows={8}
        required
        aria-describedby={`${idPrefix}-content-hint`}
        onChange={(e) => onChange({ ...data, content: e.target.value })}
      />
      <p id={`${idPrefix}-content-hint`} className="text-xs text-mist">
        Line breaks are kept on the website.
      </p>
    </div>
    <div className="flex items-center gap-2.5">
      <Switch
        id={`${idPrefix}-visible`}
        checked={data.is_visible}
        onCheckedChange={(checked) =>
          onChange({ ...data, is_visible: checked })
        }
      />
      <Label htmlFor={`${idPrefix}-visible`} className="font-normal">
        Shown on the website
      </Label>
    </div>
    <div className="flex items-center justify-end gap-2 border-t pt-5">
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={saving}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
        {saving ? "Saving…" : saveLabel}
      </Button>
    </div>
  </form>
);

interface SortableBlockProps {
  block: AboutBlock;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  editing: boolean;
  formData: BlockFormData;
  setFormData: (data: BlockFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: (block: AboutBlock) => void;
  onDelete: (block: AboutBlock) => void;
  onToggleVisibility: (block: AboutBlock) => void;
  onMove: (block: AboutBlock, by: -1 | 1) => void;
  saving: boolean;
}

const SortableBlock = ({
  block,
  isFirst,
  isLast,
  busy,
  editing,
  formData,
  setFormData,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onToggleVisibility,
  onMove,
  saving,
}: SortableBlockProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: editing });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative bg-white px-4 py-3.5 sm:px-5",
        isDragging && "z-10 shadow-lg"
      )}
    >
      {editing ? (
        <BlockForm
          idPrefix={`block-${block.id}`}
          data={formData}
          onChange={setFormData}
          onSave={onSave}
          onCancel={onCancel}
          saving={saving}
          saveLabel="Save section"
        />
      ) : (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Drag to reorder “${block.title}”`}
            className="-ml-1.5 inline-flex size-8 cursor-grab items-center justify-center rounded-md text-mist hover:bg-accent hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing sm:row-span-1"
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <button
                type="button"
                onClick={() => onEdit(block)}
                className="min-w-0 truncate text-left text-sm font-medium text-ink hover:underline focus-visible:underline focus-visible:outline-none"
              >
                {block.title}
              </button>
              {!block.is_visible && (
                <StatusBadge tone="muted" icon={EyeOff}>
                  Hidden
                </StatusBadge>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-[13px] text-mist">
              {block.content}
            </p>
          </div>
          <div className="col-start-2 -ml-2 flex items-center sm:col-start-auto sm:ml-0">
            <IconAction
              label="Move up"
              icon={ArrowUp}
              disabled={isFirst || busy}
              onClick={() => onMove(block, -1)}
            />
            <IconAction
              label="Move down"
              icon={ArrowDown}
              disabled={isLast || busy}
              onClick={() => onMove(block, 1)}
            />
            <IconAction
              label={block.is_visible ? "Hide from website" : "Show on website"}
              icon={block.is_visible ? EyeOff : Eye}
              disabled={busy}
              onClick={() => onToggleVisibility(block)}
            />
            <IconAction
              label="Edit"
              icon={Pencil}
              disabled={busy}
              onClick={() => onEdit(block)}
            />
            <ConfirmDelete
              title="Delete this section?"
              description={
                <>
                  “{block.title}” will be removed from the About page. This
                  can't be undone.
                </>
              }
              disabled={busy}
              onConfirm={() => onDelete(block)}
            />
          </div>
        </div>
      )}
    </li>
  );
};

/** The About page's sections: add, edit, reorder, show/hide and delete. */
const AboutBlocksEditor = () => {
  const { toast } = useToast();
  const {
    blocks,
    loading,
    error,
    createBlock,
    updateBlock,
    toggleVisibility,
    deleteBlock,
    reorderBlocks,
  } = useAboutBlocks({ includeHidden: true });

  // null: not editing; 0: new section; otherwise the section's id
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BlockFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const saveOrder = async (ordered: AboutBlock[]) => {
    setBusy(true);
    try {
      await reorderBlocks(
        ordered.map((block, index) => ({ id: block.id, sort_order: index + 1 }))
      );
    } catch (err) {
      console.error("Error reordering blocks:", err);
      toast({
        title: "Couldn't change the order",
        description: errorMessage(err, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((b) => b.id === active.id);
    const to = blocks.findIndex((b) => b.id === over.id);
    saveOrder(arrayMove(blocks, from, to));
  };

  const handleMove = (block: AboutBlock, by: -1 | 1) => {
    const from = blocks.findIndex((b) => b.id === block.id);
    const to = from + by;
    if (to < 0 || to >= blocks.length) return;
    saveOrder(arrayMove(blocks, from, to));
  };

  const startNew = () => {
    setEditingId(0);
    setFormData(EMPTY_FORM);
  };

  const startEdit = (block: AboutBlock) => {
    setEditingId(block.id);
    setFormData({
      title: block.title,
      content: block.content,
      is_visible: block.is_visible,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Add a title and some text",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const block = blocks.find((b) => b.id === editingId);
        await updateBlock(editingId, {
          ...formData,
          sort_order: block?.sort_order ?? 0,
        });
        toast({ title: "Section saved" });
      } else {
        // New sections go at the end
        const lastOrder = Math.max(0, ...blocks.map((b) => b.sort_order));
        await createBlock({ ...formData, sort_order: lastOrder + 1 });
        toast({ title: "Section added" });
      }
      cancelEdit();
    } catch (err) {
      console.error("Error saving block:", err);
      toast({
        title: "Couldn't save the section",
        description: errorMessage(err, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (block: AboutBlock) => {
    setBusy(true);
    try {
      await deleteBlock(block.id);
      toast({ title: "Section deleted" });
    } catch (err) {
      console.error("Error deleting block:", err);
      toast({
        title: "Couldn't delete the section",
        description: errorMessage(err, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleToggleVisibility = async (block: AboutBlock) => {
    setBusy(true);
    try {
      await toggleVisibility(block.id, !block.is_visible);
      toast({
        title: block.is_visible ? "Section hidden" : "Section shown",
      });
    } catch (err) {
      console.error("Error toggling visibility:", err);
      toast({
        title: "Couldn't change the section",
        description: errorMessage(err, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title="Sections"
      description="The blocks of text on the About page, in this order. Drag a section by its handle, or use the arrows, to move it."
      actions={
        editingId !== 0 && (
          <Button variant="outline" size="sm" onClick={startNew}>
            <Plus aria-hidden="true" />
            Add section
          </Button>
        )
      }
      bodyClassName="p-0"
    >
      {loading ? (
        <p
          role="status"
          className="flex items-center gap-2 px-5 py-6 text-sm text-mist"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading sections…
        </p>
      ) : error ? (
        <p role="alert" className="px-5 py-6 text-sm text-destructive">
          Couldn't load the sections: {error}
        </p>
      ) : (
        <>
          {blocks.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((block) => block.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="divide-y">
                  {blocks.map((block, index) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      isFirst={index === 0}
                      isLast={index === blocks.length - 1}
                      busy={busy}
                      editing={editingId === block.id}
                      formData={formData}
                      setFormData={setFormData}
                      onSave={handleSave}
                      onCancel={cancelEdit}
                      onEdit={startEdit}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                      onMove={handleMove}
                      saving={saving}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}

          {editingId === 0 && (
            <div
              className={cn(
                "px-4 py-5 sm:px-5",
                blocks.length > 0 && "border-t"
              )}
            >
              <h3 className="mb-4 text-sm font-semibold text-ink">
                New section
              </h3>
              <BlockForm
                idPrefix="block-new"
                data={formData}
                onChange={setFormData}
                onSave={handleSave}
                onCancel={cancelEdit}
                saving={saving}
                saveLabel="Add section"
              />
            </div>
          )}

          {blocks.length === 0 && editingId !== 0 && (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <p className="text-sm text-mist">
                No sections yet. The About page shows only its introduction.
              </p>
              <Button className="mt-4" size="sm" onClick={startNew}>
                <Plus aria-hidden="true" />
                Add the first section
              </Button>
            </div>
          )}
        </>
      )}
    </Panel>
  );
};

export default AboutBlocksEditor;
