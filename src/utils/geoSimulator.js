/**
 * Geo-simulation utility for matching food joints and generating distances.
 * Suitable for zero-registration multi-city food joint mapping.
 */

// 1. Static arrays containing famous food spots across cities
const PATNA_FOOD_JOINTS = [
  "Kapildev's Elevens, Boring Road",
  "The Palatine, Kankarbagh",
  "Pind Balluchi, Biscomaun Tower",
  "Maurya Heritage, Fraser Road"
];

const DELHI_FOOD_JOINTS = [
  "Chacha Di Hatti, Kamla Nagar",
  "Kake Da Hotel, CP",
  "Karim's, Jama Masjid",
  "Wenger's, Connaught Place"
];

const MUMBAI_FOOD_JOINTS = [
  "Bademiya, Colaba",
  "Britannia & Co., Fort",
  "Elco Chaat, Bandra",
  "Joey's Pizza, Andheri"
];

const DEFAULT_FALLBACK_JOINTS = [
  "The Local Bistro",
  "Urban Cloud Kitchen",
  "Golden Dragon",
  "Express Food Hub"
];

/**
 * Simulates finding a nearby food joint based on the user's address.
 * Matches keywords for Patna, Delhi, or Mumbai (case-insensitive) and selects a random restaurant.
 * Dynamically computes a random distance between 3.0 and 5.0 km.
 * 
 * @param {string} userAddress - The address entered by the user
 * @returns {object} { restaurantName: string, distance: string }
 */
export function getNearbyFoodJoints(userAddress) {
  // Normalize address for case-insensitive keyword parsing
  const address = (userAddress || "").toLowerCase();
  
  let pool;
  
  // Check location and assign correct pool
  if (address.includes("patna")) {
    pool = PATNA_FOOD_JOINTS;
  } else if (address.includes("delhi")) {
    pool = DELHI_FOOD_JOINTS;
  } else if (address.includes("mumbai")) {
    pool = MUMBAI_FOOD_JOINTS;
  } else {
    pool = DEFAULT_FALLBACK_JOINTS;
  }
  
  // Select a random restaurant from the matching pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  const restaurantName = pool[randomIndex];
  
  // Generate a random distance float strictly between 3.0 and 5.0
  // Formula: Math.random() * (max - min) + min
  const distanceFloat = Math.random() * (5.0 - 3.0) + 3.0;
  
  // Format to 1 decimal place and append "km away"
  const distance = `• ${distanceFloat.toFixed(1)} km away`;
  
  return {
    restaurantName,
    distance
  };
}
