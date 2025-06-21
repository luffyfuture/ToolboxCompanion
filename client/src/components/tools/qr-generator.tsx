import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function QRGenerator() {
  const [text, setText] = useState("");
  const [size, setSize] = useState("200");
  const [qrUrl, setQrUrl] = useState("");

  const generateQR = () => {
    if (!text.trim()) return;
    
    const encodedText = encodeURIComponent(text);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
    setQrUrl(url);
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clear = () => {
    setText("");
    setQrUrl("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="text-input">Text or URL</Label>
            <Input
              id="text-input"
              placeholder="Enter text or URL to generate QR code..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="size-select">Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="150">150x150</SelectItem>
                <SelectItem value="200">200x200</SelectItem>
                <SelectItem value="300">300x300</SelectItem>
                <SelectItem value="400">400x400</SelectItem>
                <SelectItem value="500">500x500</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateQR} disabled={!text.trim()}>
              <i className="fas fa-qrcode mr-2"></i>
              Generate QR Code
            </Button>
            <Button onClick={clear} variant="outline">
              <i className="fas fa-trash mr-2"></i>
              Clear
            </Button>
          </div>

          {qrUrl && (
            <div className="text-center space-y-4">
              <div className="bg-slate-50 rounded-lg p-6 inline-block">
                <img 
                  src={qrUrl} 
                  alt="Generated QR Code" 
                  className="mx-auto"
                  style={{ width: `${size}px`, height: `${size}px` }}
                />
              </div>
              <div>
                <Button onClick={downloadQR}>
                  <i className="fas fa-download mr-2"></i>
                  Download QR Code
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            QR codes can store various types of data including text, URLs, contact information, 
            WiFi credentials, and more. They can be scanned by smartphones and other devices 
            with camera capabilities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
