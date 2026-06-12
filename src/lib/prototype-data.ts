import {
  CalendarDays,
  Hash,
  Headphones,
  MessageSquareText,
  Newspaper,
  RadioTower,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Source = {
  id: string;
  name: string;
  icon: LucideIcon;
  signal: string;
  detail: string;
};

export type HostProfile = {
  id: string;
  label: string;
  tone: string;
};

export const sources = [
  {
    id: "slack",
    name: "Slack",
    icon: Hash,
    signal: "team pulse",
    detail: "Unread channels, decisions, blockers, and launch chatter.",
  },
  {
    id: "hacker-news",
    name: "Hacker News",
    icon: Newspaper,
    signal: "story radar",
    detail: "Top threads, fast-rising links, and founder-grade commentary.",
  },
  {
    id: "luma",
    name: "Luma",
    icon: CalendarDays,
    signal: "event intel",
    detail: "Upcoming rooms, guest overlap, and people worth finding.",
  },
  {
    id: "paste",
    name: "Anything",
    icon: MessageSquareText,
    signal: "raw input",
    detail: "Paste URLs, notes, transcripts, research, or a whole brief.",
  },
] as const satisfies readonly Source[];

export const hostProfiles = [
  { id: "uk", label: "British", tone: "dry, sharp, composed" },
  { id: "us", label: "American", tone: "direct, energetic, warm" },
  { id: "ie", label: "Irish", tone: "wry, lyrical, humane" },
  { id: "au", label: "Australian", tone: "bright, plain-spoken, quick" },
] as const satisfies readonly HostProfile[];

export const episodes = [
  {
    title: "Launch Radar",
    status: "ready",
    length: "07:42",
    source: "Slack",
    date: "Today",
    summary: "Three product decisions, one support risk, two shipped fixes.",
  },
  {
    title: "HN Founder Sweep",
    status: "draft",
    length: "09:10",
    source: "Hacker News",
    date: "Yesterday",
    summary: "Agents, browser automation, edge databases, and pricing drama.",
  },
  {
    title: "Luma Week Ahead",
    status: "queued",
    length: "05:30",
    source: "Luma",
    date: "Mon",
    summary: "Two AI events, one investor salon, seven useful intros.",
  },
] as const;

export const pipeline = [
  { label: "Connect", icon: RadioTower },
  { label: "Summarize", icon: Sparkles },
  { label: "Cast", icon: Users },
  { label: "Publish", icon: Headphones },
] as const;
