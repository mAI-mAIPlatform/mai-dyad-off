"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { id: 'light', label: 'Clair', icon: Sun },
    { id: 'dark', label: 'Sombre', icon: Moon },
    { id: 'system', label: 'Système', icon: Monitor }
  ];

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium mb-2">Thème</h3>
      <div className="flex gap-2">
        {themes.map((themeItem) => {
          const Icon = themeItem.icon;
          return (
            <Button
              key={themeItem.id}
              variant={theme === themeItem.id ? "default" : "outline"}
              size="sm"
              className="flex-1 justify-center gap-2"
              onClick={() => setTheme(themeItem.id)}
            >
              <Icon className="w-4 h-4" />
              {themeItem.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeToggle;