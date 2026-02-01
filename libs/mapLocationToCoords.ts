export function mapLocationToCoords(
  location: string | null,
  region: string | null
): { lat: number; lng: number } | null {
  const locationLower = location?.toLowerCase() || "";
  const regionLower = region?.toLowerCase() || "";

  if (locationLower.includes("napa") || regionLower.includes("napa")) {
    return { lat: 38.29, lng: -122.28 };
  }
  if (locationLower.includes("burgundy") || regionLower.includes("burgundy")) {
    return { lat: 47.05, lng: 4.84 };
  }
  if (locationLower.includes("tuscany") || regionLower.includes("tuscany")) {
    return { lat: 43.77, lng: 11.26 };
  }
  if (locationLower.includes("bordeaux") || regionLower.includes("bordeaux")) {
    return { lat: 44.84, lng: -0.58 };
  }
  if (locationLower.includes("miami") || regionLower.includes("miami")) {
    return { lat: 25.76, lng: -80.19 };
  }
  if (locationLower.includes("new york") || locationLower.includes("nyc")) {
    return { lat: 40.71, lng: -74.01 };
  }
  if (locationLower.includes("san francisco") || locationLower.includes("sf")) {
    return { lat: 37.77, lng: -122.42 };
  }
  if (locationLower.includes("los angeles") || locationLower.includes("la")) {
    return { lat: 34.05, lng: -118.24 };
  }

  return { lat: 40.71, lng: -74.01 };
}
