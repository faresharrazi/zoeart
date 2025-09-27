import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAboutBlocks } from "@/hooks/useAboutBlocks";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { apiClient } from "@/lib/apiClient";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";

// Sortable Block Component
const SortableBlock = ({
  block,
  index,
  blocks,
  editingBlockId,
  blockFormData,
  setBlockFormData,
  handleSaveBlock,
  handleCancelBlock,
  handleEditBlock,
  handleDeleteBlock,
  handleToggleBlockVisibility,
  handleMoveBlockUp,
  handleMoveBlockDown,
  saving,
  deleting,
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "shadow-lg" : ""}`}
    >
      <CardContent className="p-4">
        {editingBlockId === block.id ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="sort_order">Rank (Sort Order)</Label>
              <Input
                id="sort_order"
                type="number"
                value={blockFormData.sort_order}
                onChange={(e) =>
                  setBlockFormData({
                    ...blockFormData,
                    sort_order: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={blockFormData.title}
                onChange={(e) =>
                  setBlockFormData({
                    ...blockFormData,
                    title: e.target.value,
                  })
                }
                placeholder="Block title"
                required
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={blockFormData.content}
                onChange={(e) =>
                  setBlockFormData({
                    ...blockFormData,
                    content: e.target.value,
                  })
                }
                placeholder="Block content"
                rows={4}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_visible"
                checked={blockFormData.is_visible}
                onCheckedChange={(checked) =>
                  setBlockFormData({
                    ...blockFormData,
                    is_visible: checked,
                  })
                }
              />
              <Label htmlFor="is_visible">Visible</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveBlock} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelBlock}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex items-center gap-2 cursor-grab active:cursor-grabbing p-1 rounded"
                              {...attributes}
                              {...listeners}
                            >
                              <GripVertical className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                                #{block.sort_order}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3 className="font-semibold text-lg">{block.title}</h3>
                              <Badge variant={block.is_visible ? "default" : "secondary"}>
                                {block.is_visible ? "Visible" : "Hidden"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMoveBlockUp(block)}
                              disabled={index === 0}
                              title="Move up"
                              className="h-9 w-9 p-0"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMoveBlockDown(block)}
                              disabled={index === blocks.length - 1}
                              title="Move down"
                              className="h-9 w-9 p-0"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleToggleBlockVisibility(block.id, !block.is_visible)
                              }
                              title={block.is_visible ? "Hide" : "Show"}
                              className="h-9 w-9 p-0"
                            >
                              {block.is_visible ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBlock(block)}
                              title="Edit"
                              className="h-9 w-9 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteBlock(block.id)}
                              disabled={deleting === block.id}
                              title="Delete"
                              className="h-9 w-9 p-0"
                            >
                              {deleting === block.id ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
            <div className="text-muted-foreground">
              <p className="line-clamp-3">{block.content}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AboutPageEditor = () => {
  const { toast } = useToast();
  const { pageData, refreshPageData } = usePageDataFromDB();
  const {
    blocks,
    loading: blocksLoading,
    error: blocksError,
    createBlock,
    updateBlock,
    toggleVisibility,
    deleteBlock,
    reorderBlocks,
    refreshBlocks: fetchBlocks,
  } = useAboutBlocks();

  // Page-level editing state
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageFormData, setPageFormData] = useState({
    title: "",
    description: "",
    isVisible: true,
  });

  // Block editing state
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [blockFormData, setBlockFormData] = useState({
    title: "",
    content: "",
    is_visible: true,
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over?.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);

      // Update sort orders
      const reorderData = newBlocks.map((block, index) => ({
        id: block.id,
        sort_order: index + 1,
      }));

      try {
        await reorderBlocks(reorderData);
        toast({
          title: "Success",
          description: "Blocks reordered successfully",
        });
      } catch (error: any) {
        console.error("Error reordering blocks:", error);
        toast({
          title: "Error",
          description: "Failed to reorder blocks",
          variant: "destructive",
        });
      }
    }
  };

  // Initialize page form data
  useEffect(() => {
    if (pageData.about) {
      setPageFormData({
        title: pageData.about.title || "",
        description: pageData.about.description || "",
        isVisible: pageData.about.isVisible !== false,
      });
    }
  }, [pageData.about]);

  // Generate next sort order
  const getNextSortOrder = () => {
    if (blocks.length === 0) return 1;
    return Math.max(...blocks.map((b) => b.sort_order)) + 1;
  };

  // Generate next block ID
  const getNextBlockId = () => {
    const existingIds = blocks.map((b) => b.block_id);
    let counter = 1;
    let blockId = `block${counter}`;
    while (existingIds.includes(blockId)) {
      counter++;
      blockId = `block${counter}`;
    }
    return blockId;
  };

  // Page-level functions
  const handleEditPage = () => {
    setIsEditingPage(true);
  };

  const handleSavePage = async () => {
    try {
      setSaving(true);
      await apiClient.updatePageContent("about", {
        title: pageFormData.title,
        description: pageFormData.description,
        isVisible: pageFormData.isVisible,
      });
      await refreshPageData();
      setIsEditingPage(false);
      toast({
        title: "Success",
        description: "About page updated successfully",
      });
    } catch (error: any) {
      console.error("Error saving page:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save page",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPage = () => {
    setIsEditingPage(false);
    setPageFormData({
      title: pageData.about?.title || "",
      description: pageData.about?.description || "",
      isVisible: pageData.about?.isVisible !== false,
    });
  };

  // Block-level functions
  const handleAddNewBlock = () => {
    setEditingBlockId(0);
    setBlockFormData({
      title: "",
      content: "",
      is_visible: true,
      sort_order: 0, // Will be automatically set to the next available position
    });
  };

  const handleEditBlock = (block: any) => {
    setEditingBlockId(block.id);
    setBlockFormData({
      title: block.title,
      content: block.content,
      is_visible: block.is_visible,
      sort_order: block.sort_order,
    });
  };

  const handleCancelBlock = () => {
    setEditingBlockId(null);
    setBlockFormData({
      title: "",
      content: "",
      is_visible: true,
      sort_order: 0,
    });
  };

  const handleSaveBlock = async () => {
    if (!blockFormData.title.trim() || !blockFormData.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      if (editingBlockId) {
        await updateBlock(editingBlockId, blockFormData);
        toast({
          title: "Success",
          description: "Block updated successfully",
        });
      } else {
        // For new blocks, automatically set sort_order to the next available position
        const blockData = {
          ...blockFormData,
          sort_order: getNextSortOrder(),
        };
        await createBlock(blockData);
        toast({
          title: "Success",
          description: "Block created successfully",
        });
      }

      handleCancelBlock();
    } catch (error: any) {
      console.error("Error saving block:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save block",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlock = async (id: number) => {
    if (!confirm("Are you sure you want to delete this block?")) return;

    try {
      setDeleting(id);
      await deleteBlock(id);
      toast({
        title: "Success",
        description: "Block deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting block:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete block",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleBlockVisibility = async (
    id: number,
    isVisible: boolean
  ) => {
    try {
      await toggleVisibility(id, isVisible);
      // Refresh the blocks to update the UI
      await fetchBlocks();
      toast({
        title: "Success",
        description: `Block ${isVisible ? "shown" : "hidden"} successfully`,
      });
    } catch (error: any) {
      console.error("Error toggling visibility:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle visibility",
        variant: "destructive",
      });
    }
  };

  const handleMoveBlockUp = async (block: any) => {
    const currentIndex = blocks.findIndex((b) => b.id === block.id);
    if (currentIndex <= 0) return;

    const newBlocks = [...blocks];
    const temp = newBlocks[currentIndex];
    newBlocks[currentIndex] = newBlocks[currentIndex - 1];
    newBlocks[currentIndex - 1] = temp;

    // Update sort orders
    const reorderData = newBlocks.map((b, index) => ({
      id: b.id,
      sort_order: index + 1,
    }));

    try {
      await reorderBlocks(reorderData);
      toast({
        title: "Success",
        description: "Block moved up successfully",
      });
    } catch (error: any) {
      console.error("Error moving block:", error);
      toast({
        title: "Error",
        description: "Failed to move block",
        variant: "destructive",
      });
    }
  };

  const handleMoveBlockDown = async (block: any) => {
    const currentIndex = blocks.findIndex((b) => b.id === block.id);
    if (currentIndex >= blocks.length - 1) return;

    const newBlocks = [...blocks];
    const temp = newBlocks[currentIndex];
    newBlocks[currentIndex] = newBlocks[currentIndex + 1];
    newBlocks[currentIndex + 1] = temp;

    // Update sort orders
    const reorderData = newBlocks.map((b, index) => ({
      id: b.id,
      sort_order: index + 1,
    }));

    try {
      await reorderBlocks(reorderData);
      toast({
        title: "Success",
        description: "Block moved down successfully",
      });
    } catch (error: any) {
      console.error("Error moving block:", error);
      toast({
        title: "Error",
        description: "Failed to move block",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page-level editing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>About Page Settings</CardTitle>
            {!isEditingPage ? (
              <Button onClick={handleEditPage}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Page
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSavePage} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={handleCancelPage}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingPage ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="page-title">Page Title</Label>
                <Input
                  id="page-title"
                  value={pageFormData.title}
                  onChange={(e) =>
                    setPageFormData({ ...pageFormData, title: e.target.value })
                  }
                  placeholder="Enter page title"
                />
              </div>
              <div>
                <Label htmlFor="page-description">Page Description</Label>
                <Textarea
                  id="page-description"
                  value={pageFormData.description}
                  onChange={(e) =>
                    setPageFormData({
                      ...pageFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter page description"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="page-visible"
                  checked={pageFormData.isVisible}
                  onCheckedChange={(checked) =>
                    setPageFormData({ ...pageFormData, isVisible: checked })
                  }
                />
                <Label htmlFor="page-visible">Page Visible</Label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                <strong>Title:</strong> {pageData.about?.title || "Not set"}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {pageData.about?.description || "Not set"}
              </p>
              <p>
                <strong>Visible:</strong>{" "}
                {pageData.about?.isVisible !== false ? "Yes" : "No"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocks management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>About Page Blocks</CardTitle>
            <Button onClick={handleAddNewBlock}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Block
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {blocksLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading about blocks...</p>
            </div>
          ) : blocksError ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error: {blocksError}</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((block) => block.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {/* New Block Form */}
                  {editingBlockId === 0 && (
                    <Card className="border-2 border-primary">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground mb-2">
                            New block will be added at the end. You can reorder
                            it later using the drag handle or arrow buttons.
                          </div>
                          <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                              id="title"
                              value={blockFormData.title}
                              onChange={(e) =>
                                setBlockFormData({
                                  ...blockFormData,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Block title"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="content">Content *</Label>
                            <Textarea
                              id="content"
                              value={blockFormData.content}
                              onChange={(e) =>
                                setBlockFormData({
                                  ...blockFormData,
                                  content: e.target.value,
                                })
                              }
                              placeholder="Block content"
                              rows={4}
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is_visible"
                              checked={blockFormData.is_visible}
                              onCheckedChange={(checked) =>
                                setBlockFormData({
                                  ...blockFormData,
                                  is_visible: checked,
                                })
                              }
                            />
                            <Label htmlFor="is_visible">Visible</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveBlock} disabled={saving}>
                              <Save className="w-4 h-4 mr-2" />
                              {saving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelBlock}
                              disabled={saving}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Existing Blocks */}
                  {blocks.map((block, index) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      index={index}
                      blocks={blocks}
                      editingBlockId={editingBlockId}
                      blockFormData={blockFormData}
                      setBlockFormData={setBlockFormData}
                      handleSaveBlock={handleSaveBlock}
                      handleCancelBlock={handleCancelBlock}
                      handleEditBlock={handleEditBlock}
                      handleDeleteBlock={handleDeleteBlock}
                      handleToggleBlockVisibility={handleToggleBlockVisibility}
                      handleMoveBlockUp={handleMoveBlockUp}
                      handleMoveBlockDown={handleMoveBlockDown}
                      saving={saving}
                      deleting={deleting}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {blocks.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No blocks found</p>
                <Button onClick={handleAddNewBlock}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Block
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPageEditor;
