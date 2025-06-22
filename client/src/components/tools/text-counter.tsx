import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function TextCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      sentences
    };
  }, [text]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Area */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Type or paste your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[300px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Text Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <Label className="text-slate-600">Characters</Label>
                  <div className="text-2xl font-bold text-slate-900">{stats.characters}</div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <Label className="text-slate-600">Characters (no spaces)</Label>
                  <div className="text-2xl font-bold text-slate-900">{stats.charactersNoSpaces}</div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <Label className="text-slate-600">Words</Label>
                  <div className="text-2xl font-bold text-slate-900">{stats.words}</div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <Label className="text-slate-600">Lines</Label>
                  <div className="text-2xl font-bold text-slate-900">{stats.lines}</div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <Label className="text-slate-600">Paragraphs</Label>
                  <div className="text-2xl font-bold text-slate-900">{stats.paragraphs}</div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <Label className="text-slate-600">Sentences</Label>
                  <div className="text-2xl font-bold text-slate-900">{stats.sentences}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
