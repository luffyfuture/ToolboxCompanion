import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CaseConverter() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard",
    });
  };

  const conversions = [
    {
      name: "UPPERCASE",
      convert: (text: string) => text.toUpperCase(),
      description: "Convert all letters to uppercase"
    },
    {
      name: "lowercase",
      convert: (text: string) => text.toLowerCase(),
      description: "Convert all letters to lowercase"
    },
    {
      name: "Title Case",
      convert: (text: string) => text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      description: "Capitalize the first letter of each word"
    },
    {
      name: "Sentence case",
      convert: (text: string) => text.toLowerCase().replace(/(^\w|\.\s+\w)/g, l => l.toUpperCase()),
      description: "Capitalize the first letter of each sentence"
    },
    {
      name: "camelCase",
      convert: (text: string) => text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()),
      description: "Convert to camelCase format"
    },
    {
      name: "PascalCase",
      convert: (text: string) => text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()).replace(/^./, l => l.toUpperCase()),
      description: "Convert to PascalCase format"
    },
    {
      name: "snake_case",
      convert: (text: string) => text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, ''),
      description: "Convert to snake_case format"
    },
    {
      name: "kebab-case",
      convert: (text: string) => text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: "Convert to kebab-case format"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Text Input</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter text to convert..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conversions.map((conversion, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{conversion.name}</CardTitle>
                  <p className="text-sm text-slate-500">{conversion.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(conversion.convert(text))}
                  disabled={!text.trim()}
                >
                  <i className="fas fa-copy mr-1"></i>
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-3 min-h-[80px] font-mono text-sm break-words">
                {text ? conversion.convert(text) : <span className="text-slate-400">Output will appear here...</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
