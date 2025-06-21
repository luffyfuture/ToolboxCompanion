export interface Tool {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  path: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  tools: Tool[];
}

export interface CalculatorHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}
