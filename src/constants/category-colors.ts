export const categoryColors = ["#64CBB1", "#65B8E8", "#EBD58A", "#E78A91", "#8A99A8", "#253746"] as const;

export type CategoryColor = (typeof categoryColors)[number];
