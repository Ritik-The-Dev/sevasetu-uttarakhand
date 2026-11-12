import {
  Baby,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Home,
  IndianRupee,
  Sprout,
  Stethoscope,
  Tractor,
  Users,
  Wheat,
  FileText,
  type LucideIcon,
} from "lucide-react";
const MAP: Record<string, LucideIcon> = {
  Baby,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Home,
  IndianRupee,
  Sprout,
  Stethoscope,
  Tractor,
  Users,
  Wheat,
};
export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const I = MAP[name] ?? FileText;
  return <I className={className} aria-hidden="true" />;
}
