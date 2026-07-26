import {
  Code2,
  BookOpen,
  Dumbbell,
  Palette,
  Music2,
  Briefcase,
  Globe,
  Languages,
  Camera,
  Utensils,
  GraduationCap,
  Heart,
  type LucideIcon,
} from "lucide-react";

export interface CommunityStyle {
  icone: LucideIcon;
  couleur: string;
  gradient: string;
  description: string;
}

const PALETTE: CommunityStyle[] = [
  {
    icone: Code2,
    couleur: "from-purple-500 to-pink-500",
    gradient: "from-purple-500/10 to-pink-500/10",
    description: "Code, apprends et construis des projets avec d'autres développeurs.",
  },
  {
    icone: BookOpen,
    couleur: "from-amber-400 to-orange-500",
    gradient: "from-amber-400/10 to-orange-500/10",
    description: "Plonge dans les livres et partage tes découvertes littéraires.",
  },
  {
    icone: Dumbbell,
    couleur: "from-emerald-400 to-teal-500",
    gradient: "from-emerald-400/10 to-teal-500/10",
    description: "Repousse tes limites et atteins tes objectifs sportifs.",
  },
  {
    icone: Palette,
    couleur: "from-rose-400 to-red-500",
    gradient: "from-rose-400/10 to-red-500/10",
    description: "Donne vie à ton imaginaire sur papier ou en numérique.",
  },
  {
    icone: Music2,
    couleur: "from-blue-400 to-indigo-500",
    gradient: "from-blue-400/10 to-indigo-500/10",
    description: "Crée, compose et partage ta passion pour la musique.",
  },
  {
    icone: Briefcase,
    couleur: "from-yellow-400 to-orange-400",
    gradient: "from-yellow-400/10 to-orange-400/10",
    description: "Construis ton projet de l'idée au lancement.",
  },
  {
    icone: Globe,
    couleur: "from-cyan-400 to-blue-500",
    gradient: "from-cyan-400/10 to-blue-500/10",
    description: "Explore le monde et partage tes voyages.",
  },
  {
    icone: Languages,
    couleur: "from-violet-400 to-purple-500",
    gradient: "from-violet-400/10 to-purple-500/10",
    description: "Apprends et pratique de nouvelles langues.",
  },
  {
    icone: Camera,
    couleur: "from-pink-400 to-rose-500",
    gradient: "from-pink-400/10 to-rose-500/10",
    description: "Capture et partage tes plus belles photos.",
  },
  {
    icone: Utensils,
    couleur: "from-orange-400 to-red-400",
    gradient: "from-orange-400/10 to-red-400/10",
    description: "Partage tes recettes et découvertes culinaires.",
  },
  {
    icone: GraduationCap,
    couleur: "from-teal-400 to-emerald-500",
    gradient: "from-teal-400/10 to-emerald-500/10",
    description: "Apprends ensemble et partage tes connaissances.",
  },
  {
    icone: Heart,
    couleur: "from-rose-400 to-pink-500",
    gradient: "from-rose-400/10 to-pink-500/10",
    description: "Prends soin de toi et des autres.",
  },
];

/**
 * Mappe un nom de communauté vers un index de palette stable.
 * Utilise un simple hash du nom pour que la même communauté
 * obtienne toujours le même style visuel.
 */
function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getCommunityStyle(name: string): CommunityStyle {
  const index = hashName(name) % PALETTE.length;
  return PALETTE[index];
}

export interface CommunityData {
  id: string;
  name: string;
  description: string | null;
  membres: number;
}

/**
 * Récupère les données réelles d'une communauté depuis l'API
 */
export async function fetchCommunity(id: string): Promise<CommunityData | null> {
  try {
    const res = await fetch(`/api/communities/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    const c = json.community;
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      membres: Array.isArray(c.community_members) ? c.community_members.length : 0,
    };
  } catch {
    return null;
  }
}
