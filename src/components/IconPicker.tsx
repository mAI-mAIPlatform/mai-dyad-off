"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Folder, 
  FileText, 
  File, 
  Clipboard, 
  BookOpen, 
  Book, 
  Briefcase, 
  FolderOpen,
  Calendar,
  CalendarDays,
  StickyNote,
  ClipboardList,
  BarChart3,
  PieChart,
  LineChart,
  Search,
  ZoomIn,
  Pen,
  PenTool,
  MapPin,
  Paperclip,
  Link,
  Ruler,
  Scissors,
  Archive,
  FileBox,
  Lock,
  Unlock,
  Key,
  Lightbulb,
  MessageSquare,
  Users,
  Bot,
  Star,
  Rocket,
  Target,
  Gem,
  Sparkles,
  Database,
  Server,
  Cpu,
  Code,
  Terminal,
  Globe,
  Map,
  Camera,
  Image,
  Music,
  Video,
  Mic,
  Headphones,
  Download,
  Upload,
  Share,
  Heart,
  ThumbsUp,
  Flag,
  Bell,
  Settings,
  Cog,
  Wrench,
  Shield,
  Award,
  Trophy,
  Crown
} from "lucide-react";

interface IconPickerProps {
  selectedIcon: string;
  onIconChange: (icon: string) => void;
}

const iconComponents: Record<string, React.ComponentType<any>> = {
  'folder': Folder,
  'file-text': FileText,
  'file': File,
  'clipboard': Clipboard,
  'book-open': BookOpen,
  'book': Book,
  'briefcase': Briefcase,
  'folder-open': FolderOpen,
  'calendar': Calendar,
  'calendar-days': CalendarDays,
  'sticky-note': StickyNote,
  'clipboard-list': ClipboardList,
  'bar-chart-3': BarChart3,
  'pie-chart': PieChart,
  'line-chart': LineChart,
  'search': Search,
  'zoom-in': ZoomIn,
  'pen': Pen,
  'pen-tool': PenTool,
  'map-pin': MapPin,
  'paperclip': Paperclip,
  'link': Link,
  'ruler': Ruler,
  'scissors': Scissors,
  'archive': Archive,
  'file-box': FileBox,
  'lock': Lock,
  'unlock': Unlock,
  'key': Key,
  'lightbulb': Lightbulb,
  'message-square': MessageSquare,
  'users': Users,
  'bot': Bot,
  'star': Star,
  'rocket': Rocket,
  'target': Target,
  'gem': Gem,
  'sparkles': Sparkles,
  'database': Database,
  'server': Server,
  'cpu': Cpu,
  'code': Code,
  'terminal': Terminal,
  'globe': Globe,
  'map': Map,
  'camera': Camera,
  'image': Image,
  'music': Music,
  'video': Video,
  'mic': Mic,
  'headphones': Headphones,
  'download': Download,
  'upload': Upload,
  'share': Share,
  'heart': Heart,
  'thumbs-up': ThumbsUp,
  'flag': Flag,
  'bell': Bell,
  'settings': Settings,
  'cog': Cog,
  'wrench': Wrench,
  'shield': Shield,
  'award': Award,
  'trophy': Trophy,
  'crown': Crown
};

const iconNames = Object.keys(iconComponents);

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onIconChange }) => {
  const SelectedIcon = iconComponents[selectedIcon] || Folder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <SelectedIcon className="w-4 h-4 text-black dark:text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-6 gap-2">
          {iconNames.map((iconName) => {
            const IconComponent = iconComponents[iconName];
            return (
              <Button
                key={iconName}
                variant={selectedIcon === iconName ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onIconChange(iconName)}
                title={iconName.replace('-', ' ')}
              >
                <IconComponent className="w-4 h-4 text-black dark:text-white" />
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;