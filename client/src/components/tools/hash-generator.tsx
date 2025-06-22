import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const generateHashes = async () => {
    if (!input.trim()) return;

    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    try {
      const results: Record<string, string> = {};

      // SHA-1
      const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
      results.sha1 = Array.from(new Uint8Array(sha1Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // SHA-256
      const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
      results.sha256 = Array.from(new Uint8Array(sha256Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // SHA-384
      const sha384Buffer = await crypto.subtle.digest('SHA-384', data);
      results.sha384 = Array.from(new Uint8Array(sha384Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // SHA-512
      const sha512Buffer = await crypto.subtle.digest('SHA-512', data);
      results.sha512 = Array.from(new Uint8Array(sha512Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Simple MD5-like hash (not cryptographically secure, for demo purposes)
      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      results.simple = Math.abs(hash).toString(16);

      setHashes(results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate hashes",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type.toUpperCase()} hash copied to clipboard`,
    });
  };

  const clear = () => {
    setInput("");
    setHashes({});
  };

  const hashTypes = [
    { key: 'sha1', name: 'SHA-1', description: '160-bit hash function' },
    { key: 'sha256', name: 'SHA-256', description: '256-bit hash function' },
    { key: 'sha384', name: 'SHA-384', description: '384-bit hash function' },
    { key: 'sha512', name: 'SHA-512', description: '512-bit hash function' },
    { key: 'simple', name: 'Simple Hash', description: 'Basic hash for demonstration' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle>Hash Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="input-text">Input Text</Label>
              <Textarea
                id="input-text"
                placeholder="Enter text to generate hashes..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={generateHashes} disabled={!input.trim()}>
                <i className="fas fa-fingerprint mr-2"></i>
                Generate Hashes
              </Button>
              <Button onClick={clear} variant="outline">
                <i className="fas fa-trash mr-2"></i>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hash Results */}
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-4">
          {hashTypes.map(({ key, name, description }) => {
            if (!hashes[key]) return null;
            
            return (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{name}</CardTitle>
                      <p className="text-sm text-slate-500">{description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(hashes[key], name)}
                    >
                      <i className="fas fa-copy mr-2"></i>
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm break-all">
                    {hashes[key]}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>About Hash Functions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Hash functions are mathematical algorithms that convert input data into a fixed-size string of characters.
            They are commonly used for data integrity verification, password storage, and digital signatures.
            Each hash algorithm produces a unique "fingerprint" of the input data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
