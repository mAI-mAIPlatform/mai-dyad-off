"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";

interface IconPickerProps {
  selectedIcon: string;
  onIconChange: (icon: string) => void;
}

const commonIcons = [
  '📁', '📄', '📝', '📋', '📓', '📔', '📕', '📖', '📗', '📘', '📙', '📚',
  '💼', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊',
  '🔍', '🔎', '🖊️', '🖋️', '✏️', '📌', '📍', '📎', '🖇️', '📏', '📐',
  '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '💡',
  '💭', '🗨️', '💬', '👥', '🤖', '⭐', '🚀', '🎯', '💎', '🔮', '✨'
];

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onIconChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-lg">
          {selectedIcon}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="grid grid-cols-8 gap-2">
          {commonIcons.map((icon) => (
            <Button
              key={icon}
              variant={selectedIcon === icon ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 text-lg"
              onClick={() => onIconChange(icon)}
            >
              {icon}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;