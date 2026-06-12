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
  disabled?: boolean;
};

export type HostProfile = {
  category?: string;
  id: string;
  label: string;
  accent: string;
  role: string;
  sample: string;
  previewUrl?: string;
};

export type MusicVibe = {
  id: string;
  label: string;
  prompt: string;
  clipPrompts: {
    intro: string;
    interBite: string;
    outro: string;
  };
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
    id: "hacker-news",
    name: "Hacker News",
    action: "Use HN",
    icon: NewspaperIcon,
    detail: "Top stories, rising threads, and the useful argument underneath.",
  },
  {
    id: "url",
    name: "URL",
    action: "Paste anything",
    icon: LinkSimpleIcon,
    detail: "Paste any link and turn the page into a tight audio episode.",
  },
  {
    id: "luma",
    name: "Luma",
    action: "Paste event URL",
    icon: CalendarDotsIcon,
    detail: "Paste a Luma event URL for agenda, attendees, and who to meet.",
  },
  {
    id: "slack",
    name: "Slack",
    action: "Coming soon",
    disabled: true,
    icon: SlackLogoIcon,
    detail: "Decisions, asks, launches, blockers, and unread team pulse.",
  },
] as const satisfies readonly Source[];

export const hostProfiles = [
  {
    id: "mara",
    label: "Mara",
    accent: "British",
    role: "calm editorial lead",
    sample: "This is Modulate. Here is the useful bit, without the noise.",
  },
  {
    id: "noah",
    label: "Noah",
    accent: "American",
    role: "sharp operator",
    sample: "You have three things worth knowing, and one decision to make.",
  },
  {
    id: "eoin",
    label: "Eoin",
    accent: "Irish",
    role: "wry analyst",
    sample: "A quick sweep through the signal, then we will call the play.",
  },
  {
    id: "billie",
    label: "Billie",
    accent: "Australian",
    role: "bright field reporter",
    sample: "Short version first, then the wrinkle that matters.",
  },
  {
    id: "amina",
    label: "Amina",
    accent: "Nigerian British",
    role: "warm strategist",
    sample: "Here is the shape of the day, and where your attention should go.",
  },
  {
    id: "luc",
    label: "Luc",
    accent: "French",
    role: "cultured skeptic",
    sample: "The headline is simple. The implication is less obvious.",
  },
] as const satisfies readonly HostProfile[];

export const musicVibes = [
  {
    id: "mist",
    label: "Morning Mist",
    prompt: "glassy, light, optimistic",
    clipPrompts: {
      intro:
        "5 second instrumental podcast intro, bright white studio feel, glassy mallets, soft sub pulse, optimistic but restrained, no vocals, clean ending",
      interBite:
        "5 second instrumental interstitial sting, glassy mallets, soft airy pulse, quick lift into silence, no vocals",
      outro:
        "5 second instrumental podcast outro, glassy optimistic resolution, soft sub, tiny shimmer tail, no vocals",
    },
    icon: SparkleIcon,
  },
  {
    id: "steel",
    label: "Steel FM",
    prompt: "precise, synthetic, editorial",
    clipPrompts: {
      intro:
        "5 second instrumental podcast intro, precise steel-blue synth pulse, editorial news texture, clean transient rhythm, no vocals",
      interBite:
        "5 second instrumental inter-bite bumper, tight synth tick, metallic soft chord, decisive but understated, no vocals",
      outro:
        "5 second instrumental podcast outro, clean synth cadence, muted steel tone, short confident finish, no vocals",
    },
    icon: MusicNotesIcon,
  },
  {
    id: "chrome",
    label: "Chrome Wink",
    prompt: "sleek, playful, glossy",
    clipPrompts: {
      intro:
        "5 second instrumental podcast intro, glossy chrome synth pluck, playful premium UI sound, tiny bass bounce, no vocals",
      interBite:
        "5 second instrumental interstitial sting, chrome synth glint, small bounce, clean negative space, no vocals",
      outro:
        "5 second instrumental podcast outro, glossy synth wink, rounded bass note, polished final sparkle, no vocals",
    },
    icon: SparkleIcon,
  },
  {
    id: "paper",
    label: "Paper Trail",
    prompt: "tactile, percussive, clever",
    clipPrompts: {
      intro:
        "5 second instrumental podcast intro, tactile paper clicks, warm muted marimba, smart newsroom rhythm, no vocals",
      interBite:
        "5 second instrumental inter-bite bumper, paper click percussion, tiny marimba answer, elegant and quick, no vocals",
      outro:
        "5 second instrumental podcast outro, soft paper percussion, warm wooden resolve, crisp final tap, no vocals",
    },
    icon: MusicNotesIcon,
  },
  {
    id: "lumen",
    label: "Lumen",
    prompt: "warm, luminous, human",
    clipPrompts: {
      intro:
        "5 second instrumental podcast intro, warm luminous analog pad, gentle Rhodes chord, human and premium, no vocals",
      interBite:
        "5 second instrumental interstitial sting, warm Rhodes fragment, soft analog swell, friendly transition, no vocals",
      outro:
        "5 second instrumental podcast outro, luminous warm chord, soft tape texture, peaceful finish, no vocals",
    },
    icon: SparkleIcon,
  },
  {
    id: "metro",
    label: "Metroline",
    prompt: "kinetic, urban, efficient",
    clipPrompts: {
      intro:
        "5 second instrumental podcast intro, kinetic urban minimal beat, muted transit chime, efficient forward motion, no vocals",
      interBite:
        "5 second instrumental inter-bite bumper, short transit chime, tight kick pulse, clean handoff, no vocals",
      outro:
        "5 second instrumental podcast outro, minimal urban beat resolves into soft transit tone, no vocals",
    },
    icon: MusicNotesIcon,
  },
  {
    id: "signal",
    label: "Signal Glass",
    prompt: "digital, bright, exact",
    clipPrompts: {
      intro:
        "5 second instrumental podcast intro, bright digital glass arpeggio, exact signal tone, subtle bass bed, no vocals",
      interBite:
        "5 second instrumental interstitial sting, glass arpeggio flicker, tiny digital accent, no vocals",
      outro:
        "5 second instrumental podcast outro, bright glass arpeggio resolves cleanly, exact and calm, no vocals",
    },
    icon: SparkleIcon,
  },
  {
    id: "afterglow",
    label: "Afterglow",
    prompt: "soft, cinematic, resolved",
    clipPrompts: {
      intro:
        "5 second instrumental podcast intro, soft cinematic afterglow, intimate piano felt, airy pad, restrained optimism, no vocals",
      interBite:
        "5 second instrumental inter-bite bumper, felt piano accent, airy pad swell, quiet reset, no vocals",
      outro:
        "5 second instrumental podcast outro, soft cinematic piano resolution, airy afterglow tail, no vocals",
    },
    icon: MusicNotesIcon,
  },
] as const satisfies readonly MusicVibe[];

export const lengthCaps = [
  { id: "bullet", label: "Bullet", cap: "1 min", seconds: 60 },
  { id: "brief", label: "Brief", cap: "3 min", seconds: 180 },
  { id: "story", label: "Story", cap: "5 min", seconds: 300 },
] as const satisfies readonly LengthCap[];
