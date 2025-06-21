import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SystemInfo {
  browser: string;
  version: string;
  platform: string;
  userAgent: string;
  language: string;
  timezone: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  connection?: {
    effectiveType: string;
    downlink: number;
  };
  memory?: number;
  cores?: number;
}

export default function SystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getSystemInfo = () => {
      const nav = navigator as any;
      
      // Detect browser
      let browser = "Unknown";
      let version = "Unknown";
      
      if (nav.userAgentData) {
        const brands = nav.userAgentData.brands;
        const mainBrand = brands.find((brand: any) => 
          !brand.brand.includes("Not") && !brand.brand.includes("Chromium")
        );
        if (mainBrand) {
          browser = mainBrand.brand;
          version = mainBrand.version;
        }
      } else {
        const userAgent = nav.userAgent;
        if (userAgent.includes("Chrome")) {
          browser = "Chrome";
          version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown";
        } else if (userAgent.includes("Firefox")) {
          browser = "Firefox";
          version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
        } else if (userAgent.includes("Safari")) {
          browser = "Safari";
          version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "Unknown";
        } else if (userAgent.includes("Edge")) {
          browser = "Edge";
          version = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || "Unknown";
        }
      }

      const info: SystemInfo = {
        browser,
        version,
        platform: nav.platform || "Unknown",
        userAgent: nav.userAgent,
        language: nav.language || "Unknown",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio || 1
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      // Network information (if available)
      if ('connection' in nav) {
        const connection = nav.connection;
        info.connection = {
          effectiveType: connection.effectiveType || "Unknown",
          downlink: connection.downlink || 0
        };
      }

      // Memory (if available)
      if ('deviceMemory' in nav) {
        info.memory = nav.deviceMemory;
      }

      // CPU cores (if available)
      if ('hardwareConcurrency' in nav) {
        info.cores = nav.hardwareConcurrency;
      }

      setSystemInfo(info);
    };

    getSystemInfo();

    // Update viewport on resize
    const handleResize = () => {
      setSystemInfo(prev => prev ? {
        ...prev,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      } : prev);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "System information copied to clipboard",
    });
  };

  const copyAllInfo = () => {
    if (!systemInfo) return;
    
    const infoText = Object.entries(systemInfo)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return `${key}: ${JSON.stringify(value, null, 2)}`;
        }
        return `${key}: ${value}`;
      })
      .join('\n');
    
    copyToClipboard(infoText);
  };

  if (!systemInfo) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-2xl text-slate-400 mb-2"></i>
              <p className="text-slate-600">Loading system information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Information</h2>
        <Button onClick={copyAllInfo}>
          <i className="fas fa-copy mr-2"></i>
          Copy All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browser Information */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Browser:</span>
              <span className="font-mono">{systemInfo.browser}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Version:</span>
              <span className="font-mono">{systemInfo.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Platform:</span>
              <span className="font-mono">{systemInfo.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Language:</span>
              <span className="font-mono">{systemInfo.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Timezone:</span>
              <span className="font-mono">{systemInfo.timezone}</span>
            </div>
          </CardContent>
        </Card>

        {/* Display Information */}
        <Card>
          <CardHeader>
            <CardTitle>Display Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Screen Size:</span>
              <span className="font-mono">{systemInfo.screen.width} × {systemInfo.screen.height}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Viewport Size:</span>
              <span className="font-mono">{systemInfo.viewport.width} × {systemInfo.viewport.height}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Color Depth:</span>
              <span className="font-mono">{systemInfo.screen.colorDepth} bits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Pixel Ratio:</span>
              <span className="font-mono">{systemInfo.screen.pixelRatio}x</span>
            </div>
          </CardContent>
        </Card>

        {/* Hardware Information */}
        {(systemInfo.memory || systemInfo.cores) && (
          <Card>
            <CardHeader>
              <CardTitle>Hardware Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {systemInfo.cores && (
                <div className="flex justify-between">
                  <span className="text-slate-600">CPU Cores:</span>
                  <span className="font-mono">{systemInfo.cores}</span>
                </div>
              )}
              {systemInfo.memory && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Device Memory:</span>
                  <span className="font-mono">{systemInfo.memory} GB</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Network Information */}
        {systemInfo.connection && (
          <Card>
            <CardHeader>
              <CardTitle>Network Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Connection Type:</span>
                <span className="font-mono">{systemInfo.connection.effectiveType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Downlink:</span>
                <span className="font-mono">{systemInfo.connection.downlink} Mbps</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Agent */}
      <Card>
        <CardHeader>
          <CardTitle>User Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm break-all">
            {systemInfo.userAgent}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
