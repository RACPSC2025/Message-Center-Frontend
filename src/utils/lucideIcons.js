import {
  Scale, Shield, CalendarDays, CheckCircle, ClipboardCheck, Gavel,
  HeartPulse, LayoutGrid, ChevronLeft, ChevronRight, ChevronDown,
  Bell, User, LogOut, Globe, BarChart3, Settings, HelpCircle,
  Lock, Pin, PinOff, Leaf, Search, FileText
} from 'lucide-react';

const ICON_MAP = {
  Scale, Shield, CalendarDays, CheckCircle, ClipboardCheck, Gavel,
  HeartPulse, LayoutGrid, ChevronLeft, ChevronRight, ChevronDown,
  Bell, User, LogOut, Globe, BarChart3, Settings, HelpCircle,
  Lock, Pin, PinOff, Leaf, Search, FileText
};

export function getLucideIcon(name) {
  return ICON_MAP[name] ?? LayoutGrid;
}
