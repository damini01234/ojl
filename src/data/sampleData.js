// High-quality sample food video datasets and mock restaurant information for MukBites.
// Uses public high-definition vertical food loop videos from Mixkit.

export const SAMPLE_REELS = [
  {
    id: 'mukbites-reel-1',
    username: 'burger_palace',
    profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-sauce-on-a-freshly-made-burger-44584-large.mp4',
    foodImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop',
    caption: 'Behold the Cheesy Lava Burger! Drenched in hot cheddar cheese sauce 🍔🧀. Double patty, extra crispy lettuce. #burgerlove #cheese #fastfood #mukbites',
    likesCount: 1542,
    sharesCount: 384,
    isLiked: false,
    isSaved: false,
    dishName: 'Cheesy Lava Burger',
    restaurantName: 'The Burger Palace, Boring Road',
    price: 249,
    rating: 4.7,
    deliveryTime: '20-25 mins',
    deliveryFee: 30,
    followersCount: 1240
  },
  {
    id: 'mukbites-reel-2',
    username: 'pizzeria_napoli',
    profilePic: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-freshly-baked-pizza-with-mozzarella-cheese-and-tomatoes-44583-large.mp4',
    foodImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop',
    caption: 'Freshly baked woodfired Pepperoni Pizza straight from the brick oven 🍕🔥! Stretch that mozzarella! #pizza #pepperoni #italian #mukbites',
    likesCount: 2891,
    sharesCount: 912,
    isLiked: false,
    isSaved: false,
    dishName: 'Woodfired Pepperoni Pizza',
    restaurantName: 'Pizzeria Napoli, Fraser Road',
    price: 449,
    rating: 4.8,
    deliveryTime: '25-30 mins',
    deliveryFee: 40,
    followersCount: 3820
  },
  {
    id: 'mukbites-reel-3',
    username: 'fluffys_cafe',
    profilePic: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=100&h=100&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-honey-on-pancakes-42681-large.mp4',
    foodImage: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=300&fit=crop',
    caption: 'Good morning starts with fluffy golden pancakes drenched in pure organic honey 🥞🍯. Topped with fresh berries. #pancakes #breakfast #dessert #mukbites',
    likesCount: 1803,
    sharesCount: 245,
    isLiked: false,
    isSaved: false,
    dishName: 'Fluffy Honey Pancakes',
    restaurantName: "Fluffy's Cafe, Kankarbagh",
    price: 189,
    rating: 4.5,
    deliveryTime: '15-20 mins',
    deliveryFee: 25,
    followersCount: 890
  },
  {
    id: 'mukbites-reel-4',
    username: 'green_fresh',
    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/40531/40531-1080.mp4',
    foodImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop',
    caption: 'Healthy can be extremely delicious! Tossing our signature Mediterranean Quinoa Salad with olive oil and lemon vinaigrette 🥗🍋. #healthyfood #salad #gourmet #mukbites',
    likesCount: 843,
    sharesCount: 76,
    isLiked: false,
    isSaved: false,
    dishName: 'Mediterranean Salad',
    restaurantName: 'Green & Fresh Co., Patliputra',
    price: 219,
    rating: 4.3,
    deliveryTime: '18-22 mins',
    deliveryFee: 30,
    followersCount: 1540
  }
];

export const MOCK_RESTAURANTS = [
  {
    name: 'The Burger Palace, Boring Road',
    address: 'Boring Road Crossing, Patna, Bihar 800001',
    rating: 4.7,
    deliveryFee: 30
  },
  {
    name: 'Pizzeria Napoli, Fraser Road',
    address: 'Fraser Road, Near Dak Bungalow Crossing, Patna, Bihar 800001',
    rating: 4.8,
    deliveryFee: 40
  },
  {
    name: "Fluffy's Cafe, Kankarbagh",
    address: 'Kankarbagh Main Road, Opp. PC Jewellers, Patna, Bihar 800020',
    rating: 4.5,
    deliveryFee: 25
  },
  {
    name: 'Green & Fresh Co., Patliputra',
    address: 'Patliputra Colony, Near Alpana Market, Patna, Bihar 800013',
    rating: 4.3,
    deliveryFee: 30
  }
];

// High-quality user profile picture presets (Unsplash foodies & chefs)
export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop'
];
