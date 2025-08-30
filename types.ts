export interface HistoryItem {
  url: string;
  content: string;
}

export interface RepoData {
  languages: Record<string, number>;
  tree: string[];
  dependencies: string[];
}

export interface ReadmeJson {
  projectTitle: string;
  tagline: string;
  badges: { label: string; url: string }[];
  description: string;
  keyFeatures: string[];
  technologies: { name: string; badgeUrl: string }[];
  installation: string[];
  usage: string;
  contributing: string;
  license: string;
}