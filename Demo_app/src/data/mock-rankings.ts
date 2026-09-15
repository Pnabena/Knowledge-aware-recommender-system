import type { RankingResult } from "@/types/ranking";

// Explicit, fictional rank fixtures. The query never changes these ranks.
// Each business has both ranks, including when its counterpart falls outside Top K.
// Photos are illustrative assets from the existing demo; null means no visual image.
export const mockRankings: RankingResult[] = [
  { businessId: "thai-garden", name: "Thai Garden", categories: ["Thai", "Outdoor Dining"], rating: 4.5, image: "/images/cafe.jpg", mmRank: 1, nvRank: 13 },
  { businessId: "lemongrass-house", name: "Lemongrass House", categories: ["Thai", "Asian Fusion"], rating: 4.5, image: "/images/restaurant.jpg", mmRank: 2, nvRank: 5 },
  { businessId: "little-bangkok", name: "Little Bangkok", categories: ["Thai", "Noodles"], rating: 4, image: null, mmRank: 3, nvRank: 2 },
  { businessId: "01", name: "The Copper Room", categories: ["French", "Seafood"], rating: 4.5, image: "/images/warm-interior.jpg", mmRank: 4, nvRank: 4 },
  { businessId: "sabai-table", name: "Sabai Table", categories: ["Thai", "Comfort Food"], rating: 4, image: "/images/dining-room.jpg", mmRank: 5, nvRank: 9 },
  { businessId: "orchid-kitchen", name: "Orchid Kitchen", categories: ["Thai", "Vegetarian"], rating: 4.5, image: "/images/salad.jpg", mmRank: 6, nvRank: 18 },
  { businessId: "28", name: "Bamboo Garden", categories: ["Asian", "Outdoor Dining"], rating: 4, image: "/images/bowl.jpg", mmRank: 7, nvRank: 3 },
  { businessId: "saffron-social", name: "Saffron Social", categories: ["Asian Fusion", "Cocktails"], rating: 4.5, image: "/images/bar.jpg", mmRank: 8, nvRank: 8 },
  { businessId: "02", name: "Sunday Table", categories: ["Asian", "Modern"], rating: 4, image: null, mmRank: 9, nvRank: 16 },
  { businessId: "ginger-lime", name: "Ginger & Lime", categories: ["Thai", "Seafood"], rating: 4.5, image: "/images/seafood.jpg", mmRank: 10, nvRank: 6 },
  { businessId: "lotus-corner", name: "Lotus Corner", categories: ["Thai", "Casual Dining"], rating: 4, image: null, mmRank: 11, nvRank: 1 },
  { businessId: "chilli-basil", name: "Chilli & Basil", categories: ["Thai", "Street Food"], rating: 4, image: "/images/steak.jpg", mmRank: 12, nvRank: 7 },
  { businessId: "mekong-room", name: "The Mekong Room", categories: ["Vietnamese", "Thai"], rating: 4.5, image: null, mmRank: 13, nvRank: 11 },
  { businessId: "10", name: "Olive & Oak", categories: ["Modern", "Seasonal"], rating: 4.5, image: "/images/restaurant.jpg", mmRank: 14, nvRank: 14 },
  { businessId: "tamarind-courtyard", name: "Tamarind Courtyard", categories: ["Thai", "Outdoor Dining"], rating: 4, image: "/images/terrace.jpg", mmRank: 15, nvRank: 20 },
  { businessId: "rice-paper", name: "Rice Paper", categories: ["Vietnamese", "Asian Fusion"], rating: 4, image: null, mmRank: 16, nvRank: 10 },
  { businessId: "26", name: "The Dining Hall", categories: ["Modern", "Seasonal"], rating: 4, image: "/images/warm-interior.jpg", mmRank: 17, nvRank: 12 },
  { businessId: "golden-wok", name: "Golden Wok", categories: ["Chinese", "Thai"], rating: 3.5, image: null, mmRank: 18, nvRank: 15 },
  { businessId: "20", name: "Fire & Flour", categories: ["Pizza", "Italian"], rating: 4, image: "/images/pizza.jpg", mmRank: 19, nvRank: 19 },
  { businessId: "22", name: "Bluewater", categories: ["Seafood", "French"], rating: 4.5, image: "/images/seafood.jpg", mmRank: 20, nvRank: 17 },
];
