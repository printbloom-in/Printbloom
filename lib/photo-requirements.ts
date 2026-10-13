export interface PhotoRequirement {
  min: number; // Keep 0 for display-only so no blocking occurs
  totalText: string;
}

// Data-driven map of photo requirements
// Exactly matches client spec:
// 8 Sides: 30–40 photos recommended
// 12 Sides: 45–55 photos recommended
// 16 Sides: 60–70 photos recommended
// 20 Sides: 75–85 photos recommended
export const PHOTO_REQUIREMENTS: Record<string, Record<string, PhotoRequirement>> = {
  "custom-magazine-a5": {
    "8 Pages": { min: 0, totalText: "30–40" },
    "12 Pages": { min: 0, totalText: "45–55" },
    "16 Pages": { min: 0, totalText: "60–70" },
    "20 Pages": { min: 0, totalText: "75–85" },
    "8 Sides": { min: 0, totalText: "30–40" },
    "12 Sides": { min: 0, totalText: "45–55" },
    "16 Sides": { min: 0, totalText: "60–70" },
    "20 Sides": { min: 0, totalText: "75–85" },
  },
  "custom-magazine-a4": {
    "8 Pages": { min: 0, totalText: "30–40" },
    "12 Pages": { min: 0, totalText: "45–55" },
    "16 Pages": { min: 0, totalText: "60–70" },
    "20 Pages": { min: 0, totalText: "75–85" },
    "8 Sides": { min: 0, totalText: "30–40" },
    "12 Sides": { min: 0, totalText: "45–55" },
    "16 Sides": { min: 0, totalText: "60–70" },
    "20 Sides": { min: 0, totalText: "75–85" },
  },
  "softcopy-magazine": {
    "8 Pages": { min: 0, totalText: "30–40" },
    "12 Pages": { min: 0, totalText: "45–55" },
    "16 Pages": { min: 0, totalText: "60–70" },
    "20 Pages": { min: 0, totalText: "75–85" },
    "8 Sides": { min: 0, totalText: "30–40" },
    "12 Sides": { min: 0, totalText: "45–55" },
    "16 Sides": { min: 0, totalText: "60–70" },
    "20 Sides": { min: 0, totalText: "75–85" },
  },
  "photo-frames": {
    "Small": { min: 0, totalText: "7–8" },
    "Medium": { min: 0, totalText: "10–12" },
    "Large": { min: 0, totalText: "15–20" },
  },
  "polaroids": {
    "15 pcs": { min: 0, totalText: "15" },
    "25 pcs": { min: 0, totalText: "25" },
  },
  "spotify-cards": {
    "3 cards": { min: 0, totalText: "3" },
    "6 cards": { min: 0, totalText: "6" },
  },
  "desk-calendar": {
    "Default": { min: 0, totalText: "13–15" },
  },
  "personalised-newspaper": {
    "4 Pages": { min: 0, totalText: "15–20" },
    "6 Pages": { min: 0, totalText: "25" },
  },
  "fridge-magnet-polaroids": {
    "2 Magnets": { min: 0, totalText: "2" },
    "4 Magnets": { min: 0, totalText: "4" },
  },
  "keychains": {
    "1 pc": { min: 0, totalText: "1" },
    "Set of 2": { min: 0, totalText: "2" },
  },
  "photo-booth-strips": {
    "3 strips": { min: 0, totalText: "9–12" },
    "6 strips": { min: 0, totalText: "18–24" },
  }
};

export function getPhotoRequirements(slug: string, variantLabel: string): PhotoRequirement {
  if (PHOTO_REQUIREMENTS[slug] && PHOTO_REQUIREMENTS[slug][variantLabel]) {
    return PHOTO_REQUIREMENTS[slug][variantLabel];
  }
  return { min: 0, totalText: "0" };
}

// Estimated delivery map per product specification
export const ESTIMATED_DELIVERY_MAP: Record<string, string> = {
  "custom-magazine-a4": "8–12 days",
  "custom-magazine-a5": "8–12 days",
  "softcopy-magazine": "8–12 days",
  "desk-calendar": "8–12 days",
  "polaroids": "6–10 days",
  "spotify-cards": "6–10 days",
  "photo-booth-strips": "6–10 days",
  "keychains": "10–14 days",
  "fridge-magnet-polaroids": "10–14 days",
  "photo-frames": "10–14 days",
  "personalised-newspaper": "6–10 days",
};

export function getEstimatedDelivery(slug: string): string {
  return ESTIMATED_DELIVERY_MAP[slug] || "7–10 days";
}
