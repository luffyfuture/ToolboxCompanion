import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Base64Encoder() {
  const [input, setInput] = useState("");
  const [encoded, setEncoded] = useState("");
  const [decoded, setDecoded] = useState("");
  const { toast } = useToast();

  const encode = () => {
    try {
      const result = btoa(unescape(encodeURIComponent(input)));
      setEncoded(result);
    } catch (error) {
      toast({
        title: "Encoding Error",
        description: "Failed to encode the text",
        variant: "destructive"
      });
    }
  };

  const decode = () => {
    try {
      const result = decodeURIComponent(escape(atob(input)));
      setDecoded(result);
    } catch (error) {
      toast({
        title: "Decoding Error",
        description: "Invalid Base64 string",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard",
    });
  };

  const clear = () => {
    setInput("");
    setEncoded("");
    setDecoded("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle>Input Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter text to encode/decode..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={encode} disabled={!input.trim()}>
              <i className="fas fa-arrow-up mr-2"></i>
              Encode to Base64
            </Button>
            <Button onClick={decode} disabled={!input.trim()} variant="outline">
              <i className="fas fa-arrow-down mr-2"></i>
              Decode from Base64
            </Button>
            <Button onClick={clear} variant="outline">
              <i className="fas fa-trash mr-2"></i>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Encoded Output */}
      {encoded && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Base64 Encoded</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(encoded)}
              >
                <i className="fas fa-copy mr-2"></i>
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm break-all">
              {encoded}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decoded Output */}
      {decoded && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Decoded Text</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(decoded)}
              >
                <i className="fas fa-copy mr-2"></i>
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm break-words">
              {decoded}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>About Base64 Encoding</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format.
            It's commonly used for encoding data in email attachments, data URLs, and web applications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
