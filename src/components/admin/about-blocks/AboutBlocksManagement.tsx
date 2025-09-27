import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAboutBlocks } from "@/hooks/useAboutBlocks";
import {
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Move,
} from "lucide-react";

const AboutBlocksManagement = () => {
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
  } = useAboutBlocks();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    block_id: "",
    title: "",
    description: "",
    content: "",
    is_visible: true,
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

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

  const handleAddNew = () => {
    setEditingId(0);
    setFormData({
      block_id: getNextBlockId(),
      title: "",
      description: "",
      content: "",
      is_visible: true,
      sort_order: getNextSortOrder(),
    });
  };

  const handleEdit = (block: any) => {
    setEditingId(block.id);
    setFormData({
      block_id: block.block_id,
      title: block.title,
      description: block.description || "",
      content: block.content,
      is_visible: block.is_visible,
      sort_order: block.sort_order,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      block_id: "",
      title: "",
      description: "",
      content: "",
      is_visible: true,
      sort_order: 0,
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await updateBlock(editingId, formData);
        toast({
          title: "Success",
          description: "Block updated successfully",
        });
      } else {
        await createBlock(formData);
        toast({
          title: "Success",
          description: "Block created successfully",
        });
      }

      handleCancel();
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

  const handleDelete = async (id: number) => {
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

  const handleToggleVisibility = async (id: number, isVisible: boolean) => {
    try {
      await toggleVisibility(id, isVisible);
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

  const handleMoveUp = async (block: any) => {
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

  const handleMoveDown = async (block: any) => {
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading about blocks...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>About Page Blocks</CardTitle>
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Block
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <Card key={block.id} className="relative">
              <CardContent className="p-4">
                {editingId === block.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="block_id">Block ID</Label>
                        <Input
                          id="block_id"
                          value={formData.block_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              block_id: e.target.value,
                            })
                          }
                          placeholder="e.g., block1, block2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sort_order">Rank (Sort Order)</Label>
                        <Input
                          id="sort_order"
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sort_order: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Block title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Short description/summary"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        placeholder="Block content"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_visible"
                        checked={formData.is_visible}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_visible: checked })
                        }
                      />
                      <Label htmlFor="is_visible">Visible</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-mono">
                            #{block.sort_order}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg">{block.title}</h3>
                        <Badge
                          variant={block.is_visible ? "default" : "secondary"}
                        >
                          {block.is_visible ? "Visible" : "Hidden"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveUp(block)}
                          disabled={index === 0}
                          title="Move up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveDown(block)}
                          disabled={index === blocks.length - 1}
                          title="Move down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleToggleVisibility(block.id, !block.is_visible)
                          }
                          title={block.is_visible ? "Hide" : "Show"}
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
                          onClick={() => handleEdit(block)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(block.id)}
                          disabled={deleting === block.id}
                          title="Delete"
                        >
                          {deleting === block.id ? (
                            "Deleting..."
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>ID:</strong> {block.block_id}
                      </p>
                      {block.description && (
                        <p>
                          <strong>Description:</strong> {block.description}
                        </p>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      <p className="line-clamp-3">{block.content}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {blocks.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No blocks found</p>
                <Button onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Block
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutBlocksManagement;
