import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const conversions = {
  length: {
    name: "Length",
    units: {
      meter: { name: "Meters", factor: 1 },
      kilometer: { name: "Kilometers", factor: 0.001 },
      centimeter: { name: "Centimeters", factor: 100 },
      millimeter: { name: "Millimeters", factor: 1000 },
      inch: { name: "Inches", factor: 39.3701 },
      foot: { name: "Feet", factor: 3.28084 },
      yard: { name: "Yards", factor: 1.09361 },
      mile: { name: "Miles", factor: 0.000621371 }
    }
  },
  weight: {
    name: "Weight",
    units: {
      kilogram: { name: "Kilograms", factor: 1 },
      gram: { name: "Grams", factor: 1000 },
      pound: { name: "Pounds", factor: 2.20462 },
      ounce: { name: "Ounces", factor: 35.274 },
      ton: { name: "Tons", factor: 0.001 }
    }
  },
  temperature: {
    name: "Temperature",
    units: {
      celsius: { name: "Celsius", factor: 1 },
      fahrenheit: { name: "Fahrenheit", factor: 1 },
      kelvin: { name: "Kelvin", factor: 1 }
    }
  }
};

export default function UnitConverter() {
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState("");

  const handleConvert = () => {
    if (!inputValue || !fromUnit || !toUnit) return;

    const value = parseFloat(inputValue);
    if (isNaN(value)) return;

    let convertedValue = 0;

    if (category === "temperature") {
      // Temperature conversion requires special handling
      if (fromUnit === "celsius" && toUnit === "fahrenheit") {
        convertedValue = (value * 9/5) + 32;
      } else if (fromUnit === "fahrenheit" && toUnit === "celsius") {
        convertedValue = (value - 32) * 5/9;
      } else if (fromUnit === "celsius" && toUnit === "kelvin") {
        convertedValue = value + 273.15;
      } else if (fromUnit === "kelvin" && toUnit === "celsius") {
        convertedValue = value - 273.15;
      } else if (fromUnit === "fahrenheit" && toUnit === "kelvin") {
        convertedValue = (value - 32) * 5/9 + 273.15;
      } else if (fromUnit === "kelvin" && toUnit === "fahrenheit") {
        convertedValue = (value - 273.15) * 9/5 + 32;
      } else {
        convertedValue = value;
      }
    } else {
      // Standard unit conversion
      const categoryData = conversions[category as keyof typeof conversions];
      const fromFactor = categoryData.units[fromUnit as keyof typeof categoryData.units].factor;
      const toFactor = categoryData.units[toUnit as keyof typeof categoryData.units].factor;
      
      // Convert to base unit, then to target unit
      const baseValue = value / fromFactor;
      convertedValue = baseValue * toFactor;
    }

    setResult(convertedValue.toFixed(6).replace(/\.?0+$/, ''));
  };

  const currentCategory = conversions[category as keyof typeof conversions];

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Unit Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(conversions).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from-unit">From</Label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currentCategory.units).map(([key, unit]) => (
                    <SelectItem key={key} value={key}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="to-unit">To</Label>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currentCategory.units).map(([key, unit]) => (
                    <SelectItem key={key} value={key}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="input-value">Value</Label>
            <Input
              id="input-value"
              type="number"
              placeholder="Enter value to convert"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (e.target.value && fromUnit && toUnit) {
                  setTimeout(handleConvert, 100);
                }
              }}
            />
          </div>

          {result && (
            <div className="bg-slate-50 rounded-lg p-4">
              <Label>Result</Label>
              <div className="text-2xl font-mono text-slate-900">{result}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
