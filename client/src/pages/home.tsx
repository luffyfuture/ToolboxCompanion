import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Calculator from "@/components/tools/calculator";
import UnitConverter from "@/components/tools/unit-converter";
import TextCounter from "@/components/tools/text-counter";
import CaseConverter from "@/components/tools/case-converter";
import Base64Encoder from "@/components/tools/base64-encoder";
import QRGenerator from "@/components/tools/qr-generator";
import ColorPicker from "@/components/tools/color-picker";
import PasswordGenerator from "@/components/tools/password-generator";
import HashGenerator from "@/components/tools/hash-generator";
import SystemInfo from "@/components/tools/system-info";
import { Tool } from "@/types/tools";

const tools: Tool[] = [
  {
    id: "calculator",
    name: "Calculator",
    category: "Mathematics",
    icon: "calculator",
    description: "Perform basic mathematical calculations",
    path: "calculator"
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    category: "Mathematics",
    icon: "exchange-alt",
    description: "Convert between different units",
    path: "unit-converter"
  },
  {
    id: "text-counter",
    name: "Text Counter",
    category: "Text Tools",
    icon: "align-left",
    description: "Count words, characters, and lines",
    path: "text-counter"
  },
  {
    id: "case-converter",
    name: "Case Converter",
    category: "Text Tools",
    icon: "font",
    description: "Convert text case styles",
    path: "case-converter"
  },
  {
    id: "base64",
    name: "Base64 Encoder",
    category: "Text Tools",
    icon: "code",
    description: "Encode and decode Base64 text",
    path: "base64"
  },
  {
    id: "qr-generator",
    name: "QR Generator",
    category: "Generators",
    icon: "qrcode",
    description: "Generate QR codes from text",
    path: "qr-generator"
  },
  {
    id: "color-picker",
    name: "Color Picker",
    category: "Generators",
    icon: "palette",
    description: "Pick and convert colors",
    path: "color-picker"
  },
  {
    id: "password-generator",
    name: "Password Generator",
    category: "Generators",
    icon: "key",
    description: "Generate secure passwords",
    path: "password-generator"
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    category: "System",
    icon: "fingerprint",
    description: "Generate hash values",
    path: "hash-generator"
  },
  {
    id: "system-info",
    name: "System Info",
    category: "System",
    icon: "info-circle",
    description: "View system information",
    path: "system-info"
  }
];

export default function Home() {
  const [activeTool, setActiveTool] = useState<Tool>(tools[0]);

  const renderTool = () => {
    switch (activeTool.id) {
      case "calculator":
        return <Calculator />;
      case "unit-converter":
        return <UnitConverter />;
      case "text-counter":
        return <TextCounter />;
      case "case-converter":
        return <CaseConverter />;
      case "base64":
        return <Base64Encoder />;
      case "qr-generator":
        return <QRGenerator />;
      case "color-picker":
        return <ColorPicker />;
      case "password-generator":
        return <PasswordGenerator />;
      case "hash-generator":
        return <HashGenerator />;
      case "system-info":
        return <SystemInfo />;
      default:
        return <Calculator />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar tools={tools} activeTool={activeTool} onToolSelect={setActiveTool} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tool Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className={`fas fa-${activeTool.icon} text-primary`}></i>
              <div>
                <h2 className="text-xl font-semibold">{activeTool.name}</h2>
                <p className="text-sm text-slate-500">{activeTool.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors">
                <i className="fas fa-expand-arrows-alt mr-1"></i>
                Fullscreen
              </button>
            </div>
          </div>
        </div>

        {/* Tool Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          {renderTool()}
        </div>
      </div>
    </div>
  );
}
