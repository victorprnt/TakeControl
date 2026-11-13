import {
  Bus,
  Coffee,
  CreditCard,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  PiggyBank,
  Plane,
  Shirt,
  ShoppingBasket,
  Sparkles,
  UserRound,
  Utensils,
  Wallet,
  Wifi,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  basket: ShoppingBasket,
  pharmacy: HeartPulse,
  spark: Sparkles,
  user: UserRound,
  home: House,
  bus: Bus,
  piggy: PiggyBank,
  card: CreditCard,
  utensils: Utensils,
  coffee: Coffee,
  gift: Gift,
  plane: Plane,
  dumbbell: Dumbbell,
  wifi: Wifi,
  shirt: Shirt,
  graduation: GraduationCap,
};

type CategoryIconProps = {
  name: string;
  className?: string;
};

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon = icons[name] ?? Wallet;
  return <Icon className={className} aria-hidden />;
}
