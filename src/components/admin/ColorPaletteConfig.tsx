import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { colorPaletteUtils, ColorPalette } from "@/lib/colorPalette";

const ColorPaletteConfig = () => {
  const [palette, setPalette] = useState<ColorPalette>({
    white: "#F9F7F7",
    lightBlue: "#DBE2EF",
    mediumBlue: "#3F72AF",
    darkNavy: "#112D4E",
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleColorChange = (colorKey: keyof ColorPalette, value: string) => {
    const newPalette = { ...palette, [colorKey]: value };
    setPalette(newPalette);

    if (isPreviewMode) {
      colorPaletteUtils.applyColorPalette(newPalette);
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
    colorPaletteUtils.applyColorPalette(palette);
  };

  const handleReset = () => {
    setIsPreviewMode(false);
    colorPaletteUtils.applyColorPalette(colorPaletteUtils.defaultPalette);
    setPalette(colorPaletteUtils.defaultPalette);
  };

  const handleSave = () => {
    // In a real app, this would save to your database
    console.log("Saving color palette:", palette);
    alert(
      "Color palette saved! (This would save to your database in production)"
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl ">
            Color Palette Configuration
          </CardTitle>
          <p className="text-muted-foreground">
            Update the website's color scheme by modifying the HEX values below.
            Changes will be applied instantly in preview mode.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* White */}
            <div className="space-y-2">
              <label className="block text-sm ">
                White/Off-white
              </label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: palette.white }}
                />
                <Input
                  value={palette.white}
                  onChange={(e) => handleColorChange("white", e.target.value)}
                  placeholder="#F9F7F7"
                  className="font-mono"
                />
              </div>
            </div>

            {/* Light Blue */}
            <div className="space-y-2">
              <label className="block text-sm ">Light Blue</label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: palette.lightBlue }}
                />
                <Input
                  value={palette.lightBlue}
                  onChange={(e) =>
                    handleColorChange("lightBlue", e.target.value)
                  }
                  placeholder="#DBE2EF"
                  className="font-mono"
                />
              </div>
            </div>

            {/* Medium Blue */}
            <div className="space-y-2">
              <label className="block text-sm ">Medium Blue</label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: palette.mediumBlue }}
                />
                <Input
                  value={palette.mediumBlue}
                  onChange={(e) =>
                    handleColorChange("mediumBlue", e.target.value)
                  }
                  placeholder="#3F72AF"
                  className="font-mono"
                />
              </div>
            </div>

            {/* Dark Navy */}
            <div className="space-y-2">
              <label className="block text-sm ">Dark Navy</label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: palette.darkNavy }}
                />
                <Input
                  value={palette.darkNavy}
                  onChange={(e) =>
                    handleColorChange("darkNavy", e.target.value)
                  }
                  placeholder="#112D4E"
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={handlePreview} variant="default">
              Preview Changes
            </Button>
            <Button onClick={handleSave} variant="outline">
              Save Palette
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset to Default
            </Button>
          </div>

          {isPreviewMode && (
            <div className="p-4 bg-palette-light-blue/10 border border-palette-medium-blue/20 rounded-lg">
              <p className="text-sm text-palette-dark-navy">
                <strong>Preview Mode Active:</strong> Changes are being applied
                in real-time. Click "Save Palette" to make them permanent, or
                "Reset to Default" to revert.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorPaletteConfig;
