import {
  CalendarDotsIcon,
  LinkSimpleIcon,
  MusicNotesIcon,
  NewspaperIcon,
  SlackLogoIcon,
  SparkleIcon,
  type Icon,
} from "@phosphor-icons/react";

export type Source = {
  id: "slack" | "hacker-news" | "luma" | "url";
  name: string;
  action: string;
  icon: Icon;
  detail: string;
};

export type HostProfile = {
  id: string;
  label: string;
  accent: string;
  sample: string;
  rate: number;
  pitch: number;
};

export type MusicVibe = {
  id: string;
  label: string;
  prompt: string;
  icon: Icon;
};

export type LengthCap = {
  id: "bullet" | "brief" | "story";
  label: string;
  cap: string;
  seconds: number;
};

export const sources = [
  {
    id: "slack",
    name: "Slack",
    action: "Link Slack",
    icon: SlackLogoIcon,
    detail: "Decisions, asks, launches, blockers, and unread team pulse.",
  },
  {
    id: "hacker-news",
    name: "Hacker News",
    action: "Use HN",
    icon: NewspaperIcon,
    detail: "Top stories, rising threads, and the useful argument underneath.",
  },
  {
    id: "luma",
    name: "Luma",
    action: "Link Luma",
    icon: CalendarDotsIcon,
    detail: "Upcoming events, guest overlap, and who to meet in the room.",
  },
  {
    id: "url",
    name: "URL",
    action: "Use URL",
    icon: LinkSimpleIcon,
    detail: "Paste any link and turn the page into a tight audio episode.",
  },
] as const satisfies readonly Source[];

export const hostProfiles = [
  {
    id: "uk",
    label: "Mara",
    accent: "British",
    sample: "This is Modulate. Here is the useful bit, without the noise.",
    rate: 0.94,
    pitch: 0.96,
  },
  {
    id: "us",
    label: "Noah",
    accent: "American",
    sample: "You have three things worth knowing, and one decision to make.",
    rate: 1,
    pitch: 1,
  },
  {
    id: "ie",
    label: "Eoin",
    accent: "Irish",
    sample: "A quick sweep through the signal, then we will call the play.",
    rate: 0.92,
    pitch: 1.03,
  },
  {
    id: "au",
    label: "Billie",
    accent: "Australian",
    sample: "Short version first, then the wrinkle that matters.",
    rate: 1.03,
    pitch: 1.02,
  },
] as const satisfies readonly HostProfile[];

export const musicVibes = [
  {
    id: "mist",
    label: "Morning Mist",
    prompt: "quiet, glassy, optimistic, restrained",
    icon: SparkleIcon,
  },
  {
    id: "steel",
    label: "Steel FM",
    prompt: "clean synth pulse, editorial, precise",
    icon: MusicNotesIcon,
  },
  {
    id: "blue",
    label: "Blue Hour",
    prompt: "cool ambient bed, intimate, late evening",
    icon: SparkleIcon,
  },
] as const satisfies readonly MusicVibe[];

export const lengthCaps = [
  { id: "bullet", label: "Bullet", cap: "1 min", seconds: 60 },
  { id: "brief", label: "Brief", cap: "3 min", seconds: 180 },
  { id: "story", label: "Story", cap: "5 min", seconds: 300 },
] as const satisfies readonly LengthCap[];
