/** Location preferences; replace this catalogue with the API's supported markets later. */
export const usLocations = [
  { id: "new-orleans-la", city: "New Orleans", state: "Louisiana" },
  { id: "atlanta-ga", city: "Atlanta", state: "Georgia" },
  { id: "austin-tx", city: "Austin", state: "Texas" },
  { id: "boston-ma", city: "Boston", state: "Massachusetts" },
  { id: "charleston-sc", city: "Charleston", state: "South Carolina" },
  { id: "charlotte-nc", city: "Charlotte", state: "North Carolina" },
  { id: "chicago-il", city: "Chicago", state: "Illinois" },
  { id: "dallas-tx", city: "Dallas", state: "Texas" },
  { id: "denver-co", city: "Denver", state: "Colorado" },
  { id: "detroit-mi", city: "Detroit", state: "Michigan" },
  { id: "houston-tx", city: "Houston", state: "Texas" },
  { id: "las-vegas-nv", city: "Las Vegas", state: "Nevada" },
  { id: "los-angeles-ca", city: "Los Angeles", state: "California" },
  { id: "miami-fl", city: "Miami", state: "Florida" },
  { id: "minneapolis-mn", city: "Minneapolis", state: "Minnesota" },
  { id: "nashville-tn", city: "Nashville", state: "Tennessee" },
  { id: "new-york-ny", city: "New York", state: "New York" },
  { id: "philadelphia-pa", city: "Philadelphia", state: "Pennsylvania" },
  { id: "phoenix-az", city: "Phoenix", state: "Arizona" },
  { id: "portland-or", city: "Portland", state: "Oregon" },
  { id: "san-diego-ca", city: "San Diego", state: "California" },
  { id: "san-francisco-ca", city: "San Francisco", state: "California" },
  { id: "seattle-wa", city: "Seattle", state: "Washington" },
  { id: "washington-dc", city: "Washington, DC", state: "District of Columbia" },
] as const;

export type LocationId = typeof usLocations[number]["id"];
export const defaultLocationId: LocationId = "new-orleans-la";
