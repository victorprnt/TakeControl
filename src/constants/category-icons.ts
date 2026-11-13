export const categoryIcons = [
  { id: "basket", label: "Mercado" },
  { id: "pharmacy", label: "Farmácia" },
  { id: "spark", label: "Lazer" },
  { id: "user", label: "Pessoa" },
  { id: "home", label: "Casa" },
  { id: "bus", label: "Transporte" },
  { id: "piggy", label: "Reserva" },
  { id: "card", label: "Assinatura" },
  { id: "utensils", label: "Refeição" },
  { id: "coffee", label: "Café" },
  { id: "gift", label: "Presente" },
  { id: "plane", label: "Viagem" },
  { id: "dumbbell", label: "Treino" },
  { id: "wifi", label: "Internet" },
  { id: "shirt", label: "Roupa" },
  { id: "graduation", label: "Estudo" },
] as const;

export type CategoryIconName = (typeof categoryIcons)[number]["id"];

export const categoryIconNames: readonly CategoryIconName[] = categoryIcons.map((icon) => icon.id);
