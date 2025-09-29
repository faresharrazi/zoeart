import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { Edit, Save, X, Clock } from "lucide-react";

interface WorkingHour {
  id: number;
  day: string;
  time_frame: string;
  is_active: boolean;
}

const WorkingHoursManagement = () => {
  const { toast } = useToast();
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const days = [
    "Monday",
    "Tuesday", 
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminWorkingHours();
      setWorkingHours(data);
    } catch (error) {
      console.error("Error fetching working hours:", error);
      toast({
        title: "Error",
        description: "Failed to fetch working hours",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchWorkingHours(); // Reset to original data
  };

  const handleSave = async () => {
    try {
      await apiClient.updateWorkingHours(workingHours);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Working hours updated successfully",
      });
    } catch (error) {
      console.error("Error updating working hours:", error);
      toast({
        title: "Error",
        description: "Failed to update working hours",
        variant: "destructive",
      });
    }
  };

  const updateWorkingHour = (id: number, field: keyof WorkingHour, value: any) => {
    setWorkingHours(prev => 
      prev.map(hour => 
        hour.id === id ? { ...hour, [field]: value } : hour
      )
    );
  };

  const toggleActive = (id: number) => {
    updateWorkingHour(id, 'is_active', !workingHours.find(h => h.id === id)?.is_active);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading working hours...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Working Hours
          </CardTitle>
          {!isEditing && (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Hours
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {workingHours.map((hour) => (
              <div key={hour.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-24">
                  <Label className="text-sm font-medium">{hour.day}</Label>
                </div>
                <div className="flex-1">
                  <Input
                    value={hour.time_frame}
                    onChange={(e) => updateWorkingHour(hour.id, 'time_frame', e.target.value)}
                    placeholder="e.g., 10:00 AM - 6:00 PM or Closed"
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={hour.is_active}
                    onCheckedChange={() => toggleActive(hour.id)}
                  />
                  <Label className="text-sm">Active</Label>
                </div>
              </div>
            ))}
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {workingHours.map((hour) => (
              <div key={hour.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium w-24">{hour.day}</span>
                  <span className="text-gray-600">{hour.time_frame}</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  hour.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {hour.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkingHoursManagement;
