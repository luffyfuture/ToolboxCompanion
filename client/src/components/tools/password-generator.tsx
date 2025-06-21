import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

export default function PasswordGenerator() {
  const [length, setLength] = useState([12]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [password, setPassword] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const { toast } = useToast();

  const generatePassword = () => {
    let charset = "";
    let similarChars = "il1Lo0O";

    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (excludeSimilar) {
      charset = charset.split("").filter(char => !similarChars.includes(char)).join("");
    }

    if (!charset) {
      toast({
        title: "Error",
        description: "Please select at least one character type",
        variant: "destructive"
      });
      return;
    }

    let newPassword = "";
    for (let i = 0; i < length[0]; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setPassword(newPassword);
    setHistory(prev => [newPassword, ...prev.slice(0, 9)]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Password copied to clipboard",
    });
  };

  const getStrengthScore = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 2) return { label: "Weak", color: "text-red-600", bg: "bg-red-100" };
    if (score <= 4) return { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "Strong", color: "text-green-600", bg: "bg-green-100" };
  };

  const strength = password ? getStrengthLabel(getStrengthScore(password)) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Password Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Length: {length[0]}</Label>
            <Slider
              value={length}
              onValueChange={setLength}
              max={50}
              min={4}
              step={1}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={setIncludeUppercase}
              />
              <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={setIncludeLowercase}
              />
              <Label htmlFor="lowercase">Lowercase (a-z)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
              />
              <Label htmlFor="numbers">Numbers (0-9)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={setIncludeSymbols}
              />
              <Label htmlFor="symbols">Symbols (!@#$%)</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="exclude-similar"
              checked={excludeSimilar}
              onCheckedChange={setExcludeSimilar}
            />
            <Label htmlFor="exclude-similar">Exclude similar characters (il1Lo0O)</Label>
          </div>

          <Button onClick={generatePassword} className="w-full">
            <i className="fas fa-key mr-2"></i>
            Generate Password
          </Button>
        </CardContent>
      </Card>

      {/* Generated Password */}
      {password && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Password</CardTitle>
              {strength && (
                <span className={`px-2 py-1 text-xs font-semibold rounded ${strength.bg} ${strength.color}`}>
                  {strength.label}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input
                value={password}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(password)}
              >
                <i className="fas fa-copy"></i>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Passwords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((historyPassword, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="font-mono text-sm truncate flex-1 mr-2">{historyPassword}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(historyPassword)}
                  >
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
