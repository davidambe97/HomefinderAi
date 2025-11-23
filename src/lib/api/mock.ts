export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: string;
  images: string[];
  description: string;
  features: string[];
  yearBuilt: number;
  lotSize: number;
  source: string;
  listingDate: string;
}

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Downtown Loft',
    price: 875000,
    location: '123 Market St',
    city: 'San Francisco',
    state: 'CA',
    bedrooms: 2,
    bathrooms: 2,
    area: 1450,
    propertyType: 'Condo',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    ],
    description: 'Stunning modern loft in the heart of downtown with panoramic city views. Features high ceilings, floor-to-ceiling windows, and premium finishes throughout.',
    features: ['Hardwood Floors', 'City Views', 'In-Unit Laundry', 'Parking Included', 'Gym Access'],
    yearBuilt: 2019,
    lotSize: 0,
    source: 'Zillow',
    listingDate: '2024-01-15',
  },
  {
    id: '2',
    title: 'Charming Victorian Home',
    price: 1250000,
    location: '456 Oak Avenue',
    city: 'Portland',
    state: 'OR',
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    propertyType: 'House',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    ],
    description: 'Beautifully restored Victorian home with original details and modern updates. Located in a quiet, tree-lined neighborhood.',
    features: ['Original Details', 'Updated Kitchen', 'Large Backyard', 'Garage', 'Fireplace'],
    yearBuilt: 1895,
    lotSize: 6500,
    source: 'Realtor.com',
    listingDate: '2024-01-20',
  },
  {
    id: '3',
    title: 'Luxury Waterfront Villa',
    price: 3200000,
    location: '789 Coastal Drive',
    city: 'Miami',
    state: 'FL',
    bedrooms: 5,
    bathrooms: 4.5,
    area: 4200,
    propertyType: 'House',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    ],
    description: 'Spectacular waterfront estate with private dock and stunning ocean views. Features chef\'s kitchen, infinity pool, and smart home technology.',
    features: ['Ocean Views', 'Private Dock', 'Pool', 'Smart Home', 'Wine Cellar'],
    yearBuilt: 2021,
    lotSize: 12000,
    source: 'Realtor.com',
    listingDate: '2024-01-10',
  },
  {
    id: '4',
    title: 'Cozy Suburban Retreat',
    price: 425000,
    location: '321 Maple Street',
    city: 'Austin',
    state: 'TX',
    bedrooms: 3,
    bathrooms: 2,
    area: 1850,
    propertyType: 'House',
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    description: 'Perfect family home in quiet neighborhood with excellent schools. Open floor plan with vaulted ceilings and large backyard.',
    features: ['Open Floor Plan', 'Updated Bathrooms', 'Backyard', '2-Car Garage', 'Near Schools'],
    yearBuilt: 2015,
    lotSize: 7800,
    source: 'Zillow',
    listingDate: '2024-01-18',
  },
  {
    id: '5',
    title: 'Urban Studio Apartment',
    price: 295000,
    location: '555 Broadway',
    city: 'New York',
    state: 'NY',
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    propertyType: 'Condo',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    ],
    description: 'Efficient studio in prime location with renovated kitchen and bathroom. Perfect for young professionals.',
    features: ['Renovated Kitchen', 'Doorman', 'Laundry in Building', 'Near Transit', 'Low Maintenance'],
    yearBuilt: 1985,
    lotSize: 0,
    source: 'StreetEasy',
    listingDate: '2024-01-22',
  },
  {
    id: '6',
    title: 'Mountain View Ranch',
    price: 985000,
    location: '777 Ranch Road',
    city: 'Denver',
    state: 'CO',
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
    propertyType: 'House',
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    ],
    description: 'Stunning ranch-style home with breathtaking mountain views. Features spacious great room, gourmet kitchen, and wraparound deck.',
    features: ['Mountain Views', 'Vaulted Ceilings', 'Deck', 'Fireplace', 'Attached Garage'],
    yearBuilt: 2018,
    lotSize: 15000,
    source: 'Zillow',
    listingDate: '2024-01-12',
  },
  {
    id: '7',
    title: 'Historic Brownstone',
    price: 2400000,
    location: '234 Park Place',
    city: 'Boston',
    state: 'MA',
    bedrooms: 4,
    bathrooms: 3.5,
    area: 3500,
    propertyType: 'Townhouse',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    ],
    description: 'Meticulously maintained brownstone with original architectural details. Includes finished basement and private garden.',
    features: ['Historic Details', 'Private Garden', 'Finished Basement', 'Parking', 'Updated Systems'],
    yearBuilt: 1890,
    lotSize: 3200,
    source: 'Realtor.com',
    listingDate: '2024-01-08',
  },
  {
    id: '8',
    title: 'Contemporary Beach House',
    price: 1850000,
    location: '888 Shoreline Blvd',
    city: 'San Diego',
    state: 'CA',
    bedrooms: 3,
    bathrooms: 3,
    area: 2400,
    propertyType: 'House',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80',
    ],
    description: 'Modern coastal living at its finest. Open-concept design with walls of glass opening to ocean-view patio.',
    features: ['Ocean Views', 'Modern Design', 'Outdoor Living', 'Beach Access', 'Solar Panels'],
    yearBuilt: 2020,
    lotSize: 5500,
    source: 'Zillow',
    listingDate: '2024-01-16',
  },
  {
    id: '9',
    title: 'Garden Apartment',
    price: 385000,
    location: '999 Green Street',
    city: 'Seattle',
    state: 'WA',
    bedrooms: 2,
    bathrooms: 1,
    area: 950,
    propertyType: 'Condo',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
    ],
    description: 'Bright ground-floor unit with private patio and garden access. Recently updated with new flooring and appliances.',
    features: ['Private Patio', 'Garden Access', 'Pet Friendly', 'Storage', 'Near Parks'],
    yearBuilt: 2005,
    lotSize: 0,
    source: 'Redfin',
    listingDate: '2024-01-19',
  },
  {
    id: '10',
    title: 'Lakefront Estate',
    price: 2750000,
    location: '101 Lake View Drive',
    city: 'Chicago',
    state: 'IL',
    bedrooms: 5,
    bathrooms: 4,
    area: 4800,
    propertyType: 'House',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    ],
    description: 'Magnificent lakefront property with private beach and pier. Luxurious finishes and smart home integration throughout.',
    features: ['Lake Views', 'Private Beach', 'Pier', 'Smart Home', 'Home Theater'],
    yearBuilt: 2022,
    lotSize: 18000,
    source: 'Zillow',
    listingDate: '2024-01-11',
  },
];

export async function mockSearch(filters?: Partial<{
  location: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  bathrooms: number;
}>): Promise<Property[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  let results = [...mockProperties];

  if (filters) {
    if (filters.location) {
      const location = filters.location.toLowerCase();
      results = results.filter(
        (p) =>
          p.city.toLowerCase().includes(location) ||
          p.state.toLowerCase().includes(location) ||
          p.location.toLowerCase().includes(location)
      );
    }

    if (filters.propertyType && filters.propertyType !== 'any') {
      results = results.filter(
        (p) => p.propertyType.toLowerCase() === filters.propertyType?.toLowerCase()
      );
    }

    if (filters.minPrice) {
      results = results.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice) {
      results = results.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.bedrooms) {
      results = results.filter((p) => p.bedrooms >= filters.bedrooms!);
    }

    if (filters.bathrooms) {
      results = results.filter((p) => p.bathrooms >= filters.bathrooms!);
    }
  }

  return results;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockProperties.find((p) => p.id === id) || null;
}
