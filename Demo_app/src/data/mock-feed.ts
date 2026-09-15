import type { Business, Category } from "@/types/business";

export const mockCategories: Category[] = [
  { id: "for-you", label: "For You" },
  { id: "brunch", label: "Breakfast & Brunch" },
  { id: "seafood", label: "Seafood" },
  { id: "french", label: "French" },
  { id: "wine", label: "Cocktails & Wine" },
  { id: "asian", label: "Asian" },
  { id: "cafes", label: "Cafes" },
  { id: "nightlife", label: "Nightlife" },
  { id: "buffet", label: "Buffet" },
  { id: "fine-dining", label: "Fine Dining" },
  { id: "jerk", label: "Jerk Food" },
  { id: "fast-food", label: "Fast Food" },
  { id: "outdoor", label: "Outdoor Dining" },
  { id: "hidden-gems", label: "Hidden Gems" },
];

const photo = (id: string, alt: string) => ({ id, src: `/images/${id}.jpg`, alt });
const interior = photo("warm-interior", "Warm restaurant interior with wooden tables and pendant lighting");
const cafe = photo("cafe", "A bright, welcoming café filled with natural light");
const burger = photo("burger", "A freshly prepared burger with a golden bun and crisp vegetables");
const dining = photo("dining-room", "An airy dining room with beautifully set tables");
const brunch = photo("brunch", "A colourful breakfast spread served at the table");
const steak = photo("steak", "Grilled steak served with a fresh garnish");
const terrace = photo("terrace", "Warmly lit restaurant seating beside a well-stocked bar");
const bowl = photo("bowl", "A beautifully plated bowl of fresh food");
const coffee = photo("coffee", "Fresh coffee served in a ceramic cup");
const restaurant = photo("restaurant", "A thoughtfully designed restaurant with warm ambient lighting");
const pasta = photo("pasta", "A generous plate of pasta with herbs and sauce");
const salad = photo("salad", "A fresh seasonal salad with colourful vegetables");
const bar = photo("bar", "A softly lit bar with a collection of bottles");
const pizza = photo("pizza", "Freshly baked pizza with a golden crust");
const seafood = photo("seafood", "A beautifully presented seafood dish");
const pancakes = photo("pancakes", "A stack of pancakes with fruit for brunch");

// Fictional businesses and illustrative photographs; no live Yelp or model connection.
export const mockBusinesses: Business[] = [
  { id: "01", name: "The Copper Room", cuisine: "French · Seafood", categoryIds: ["french", "seafood", "fine-dining"], rating: 4.5, photos: [interior], aspectRatio: .72, caption: "A little French Quarter magic" },
  { id: "02", name: "Sunday Table", cuisine: "Asian · Modern", categoryIds: ["asian", "hidden-gems"], rating: 4, photos: [bowl, salad, seafood, brunch], aspectRatio: .80 },
  { id: "03", name: "Maison & Co.", cuisine: "French · Café", categoryIds: ["french", "cafes"], rating: 4.5, photos: [dining], aspectRatio: .56 },
  { id: "04", name: "Little Garden", cuisine: "Seasonal · Outdoor", categoryIds: ["outdoor", "hidden-gems"], rating: 4, photos: [terrace], aspectRatio: .85, caption: "Stay for another hour" },
  { id: "05", name: "Morning Story", cuisine: "Café · Brunch", categoryIds: ["cafes", "brunch"], rating: 4.5, photos: [cafe, coffee, pancakes, dining], aspectRatio: .76 },
  { id: "06", name: "The Glasshouse", cuisine: "Modern · Fine dining", categoryIds: ["fine-dining", "wine"], rating: 5, photos: [dining, terrace, salad, interior, restaurant], aspectRatio: .74 },
  { id: "07", name: "Bayou Kitchen", cuisine: "Creole · Buffet", categoryIds: ["buffet", "seafood"], rating: 4, photos: [restaurant], aspectRatio: .74 },
  { id: "08", name: "After Hours", cuisine: "Cocktails · Small plates", categoryIds: ["nightlife", "wine"], rating: 4.5, photos: [bar], aspectRatio: .8, caption: "One more, for the evening" },
  { id: "09", name: "Good Company", cuisine: "Burgers · American", categoryIds: ["fast-food", "brunch"], rating: 4, photos: [burger], aspectRatio: .81 },
  { id: "10", name: "Olive & Oak", cuisine: "Modern · Seasonal", categoryIds: ["fine-dining", "hidden-gems"], rating: 4.5, photos: [restaurant], aspectRatio: .95, caption: "Your new neighbourhood favourite" },
  { id: "11", name: "Courtyard Social", cuisine: "French · Outdoor", categoryIds: ["outdoor", "french"], rating: 4, photos: [terrace], aspectRatio: .73 },
  { id: "12", name: "Pasta Post", cuisine: "Italian · Comfort food", categoryIds: ["fast-food", "hidden-gems"], rating: 4.5, photos: [pasta], aspectRatio: .86 },
  { id: "13", name: "Toast & Honey", cuisine: "Breakfast · Brunch", categoryIds: ["brunch", "cafes", "buffet"], rating: 4.5, photos: [brunch], aspectRatio: .48 },
  { id: "14", name: "The Green Room", cuisine: "Seasonal · Fine dining", categoryIds: ["fine-dining", "outdoor"], rating: 4, photos: [salad, dining, terrace, bowl], aspectRatio: .80 },
  { id: "15", name: "Juniper House", cuisine: "Modern · Outdoor", categoryIds: ["outdoor", "hidden-gems"], rating: 4.5, photos: [dining], aspectRatio: .82 },
  { id: "16", name: "Petite Pause", cuisine: "Coffee · Patisserie", categoryIds: ["cafes", "french"], rating: 4, photos: [coffee], aspectRatio: .75, caption: "Take a moment for yourself" },
  { id: "17", name: "Ember & Salt", cuisine: "Grill · Jerk food", categoryIds: ["jerk", "fine-dining"], rating: 4.5, photos: [steak], aspectRatio: .81 },
  { id: "18", name: "Daylight Café", cuisine: "Café · Breakfast", categoryIds: ["cafes", "brunch"], rating: 4, photos: [cafe], aspectRatio: .78 },
  { id: "19", name: "The Corner House", cuisine: "American · Cocktails", categoryIds: ["wine", "nightlife"], rating: 4.5, photos: [restaurant], aspectRatio: .57, caption: "Good food. Even better company." },
  { id: "20", name: "Fire & Flour", cuisine: "Pizza · Italian", categoryIds: ["fast-food", "hidden-gems"], rating: 4, photos: [pizza], aspectRatio: .88 },
  { id: "21", name: "Gather on Royal", cuisine: "Modern · Brunch", categoryIds: ["brunch", "buffet"], rating: 4.5, photos: [dining], aspectRatio: .76, caption: "There's always room at the table" },
  { id: "22", name: "Bluewater", cuisine: "Seafood · French", categoryIds: ["seafood", "french"], rating: 4.5, photos: [seafood], aspectRatio: .82 },
  { id: "23", name: "Feast & Field", cuisine: "Seasonal · Buffet", categoryIds: ["buffet", "outdoor"], rating: 4, photos: [salad, brunch, seafood, bowl, terrace], aspectRatio: .81 },
  { id: "24", name: "Supper Club", cuisine: "French · Wine bar", categoryIds: ["wine", "nightlife", "french"], rating: 5, photos: [bar], aspectRatio: .66 },
  { id: "25", name: "Table for Two", cuisine: "French · Fine dining", categoryIds: ["fine-dining", "french", "wine"], rating: 4.5, photos: [terrace], aspectRatio: .71, caption: "Make an evening of it" },
  { id: "26", name: "The Dining Hall", cuisine: "Modern · Seasonal", categoryIds: ["buffet", "fine-dining"], rating: 4, photos: [interior], aspectRatio: 1.01, caption: "A beautiful space to slow down" },
  { id: "27", name: "Golden Hour", cuisine: "Breakfast · Brunch", categoryIds: ["brunch", "cafes"], rating: 4.5, photos: [pancakes], aspectRatio: .82, caption: "Slow mornings, done right" },
  { id: "28", name: "Bamboo Garden", cuisine: "Asian · Outdoor", categoryIds: ["asian", "outdoor", "jerk"], rating: 4, photos: [bowl], aspectRatio: .75 },
].map((business) => ({ ...business, location: "New Orleans, LA" }));
