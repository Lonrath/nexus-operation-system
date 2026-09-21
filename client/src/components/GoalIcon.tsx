import {
  Target, Footprints, Dumbbell, Flame, Coins, BookOpen, Code, Droplets,
  Heart, Zap, Coffee, Swords, Shield, Trophy, Utensils, Star,
} from 'lucide-react';

// Eski kodda bu 16 dallı bir switch idi ve App() içinde yaşıyordu.
// Tablo haline getirince yeni ikon eklemek tek satır.
const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Target, Footprints, Dumbbell, Flame, Coins, BookOpen, Code, Droplets,
  Heart, Zap, Coffee, Swords, Shield, Trophy, Utensils, Star,
};

export function GoalIcon({
  type,
  size = 18,
  className,
}: {
  type: string;
  size?: number;
  className?: string;
}) {
  const Comp = ICONS[type] ?? Target;
  return <Comp size={size} className={className} />;
}
