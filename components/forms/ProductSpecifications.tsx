"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface ProductSpecificationsProps {
  specifications: Record<string, string>;
  onChange: (specifications: Record<string, string>) => void;
}

export function ProductSpecifications({
  specifications,
  onChange,
}: ProductSpecificationsProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    if (!newKey.trim() || !newValue.trim()) return;

    // Check for duplicate keys
    if (specifications[newKey.trim()]) {
      return; // Key already exists
    }

    onChange({
      ...specifications,
      [newKey.trim()]: newValue.trim(),
    });

    setNewKey("");
    setNewValue("");
  };

  const handleRemove = (key: string) => {
    const newSpecs = { ...specifications };
    delete newSpecs[key];
    onChange(newSpecs);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const specEntries = Object.entries(specifications);

  return (
    <div className="space-y-4">
      <Label>Specifications (Optional)</Label>
      
      {/* Existing Specifications */}
      {specEntries.length > 0 && (
        <div className="space-y-2">
          {specEntries.map(([key, value]) => (
            <div key={key} className="flex gap-2 items-center">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input value={key} disabled className="bg-muted" />
                <Input value={value} disabled className="bg-muted" />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(key)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Specification */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="spec-key" className="text-xs text-muted-foreground">
              Key
            </Label>
            <Input
              id="spec-key"
              placeholder="e.g., Material"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div>
            <Label htmlFor="spec-value" className="text-xs text-muted-foreground">
              Value
            </Label>
            <Input
              id="spec-value"
              placeholder="e.g., Cotton"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAdd}
          disabled={!newKey.trim() || !newValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

