import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ColorPicker() {
  const [color, setColor] = useState("#3b82f6");
  const { toast } = useToast();

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${format} value copied to clipboard`,
    });
  };

  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);

  const formatValues = {
    hex: color,
    rgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '',
    rgba: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` : '',
    hsl: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : '',
    hsla: hsl ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)` : ''
  };

  const presetColors = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33F1", "#F1FF33", "#33FFF1",
    "#FF8C33", "#8C33FF", "#33FF8C", "#FF3333", "#33FF33", "#3333FF",
    "#FFD700", "#FF69B4", "#00CED1", "#FF4500", "#32CD32", "#8A2BE2",
    "#DC143C", "#00FA9A", "#4169E1", "#FF1493", "#00FF7F", "#9932CC"
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Picker */}
        <Card>
          <CardHeader>
            <CardTitle>Color Picker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div 
                className="w-32 h-32 rounded-lg border-2 border-slate-200 mx-auto mb-4"
                style={{ backgroundColor: color }}
              ></div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10 rounded cursor-pointer"
              />
            </div>

            <div>
              <Label htmlFor="hex-input">Hex Value</Label>
              <Input
                id="hex-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#000000"
              />
            </div>

            <div>
              <Label>Preset Colors</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {presetColors.map((presetColor, index) => (
                  <button
                    key={index}
                    className="w-8 h-8 rounded border-2 border-slate-200 hover:border-slate-400 transition-colors"
                    style={{ backgroundColor: presetColor }}
                    onClick={() => setColor(presetColor)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Values */}
        <Card>
          <CardHeader>
            <CardTitle>Color Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(formatValues).map(([format, value]) => (
              <div key={format} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <Label className="text-slate-600 uppercase text-xs font-semibold">
                    {format}
                  </Label>
                  <div className="font-mono text-sm">{value}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(value, format.toUpperCase())}
                >
                  <i className="fas fa-copy"></i>
                </Button>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Label className="text-slate-600">RGB Values</Label>
              {rgb && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-xs text-red-600 font-semibold">R</div>
                    <div className="font-mono">{rgb.r}</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-xs text-green-600 font-semibold">G</div>
                    <div className="font-mono">{rgb.g}</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-xs text-blue-600 font-semibold">B</div>
                    <div className="font-mono">{rgb.b}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
