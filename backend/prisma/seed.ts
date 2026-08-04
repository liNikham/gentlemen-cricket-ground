import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Cricket Grounds into database...');

  const grounds = [
    {
      name: 'Gentlemen Turf & Box Arena',
      address: 'Plot 42, Near Vaishno Devi Circle, S.G. Highway, Ahmedabad',
      mapLocationUrl: 'https://maps.google.com/?q=23.1254,72.5321',
      description: 'Premium international-standard astro-turf box cricket ground with high-intensity LED floodlights, professional pitch bounce, and dugout seating.',
      images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000'],
      weekdayPrice: 1500,
      weekendPrice: 2500,
      timeSlots: ['7:00 AM - 10:30 AM', '2:30 PM - 5:50 PM'],
      hasParking: true,
      hasCharging: true,
      hasFirstAid: true,
      hasDugout: true,
      hasWashroom: true,
      hasChangingRoom: true,
      contactName: 'Ramesh Kumar',
      contactPhone: '+919876543210',
      rules: `1. Spike shoes are strictly prohibited on astro-turf.\n2. Arrive 15 minutes prior to your allocated slot time.\n3. Smoking and alcohol consumption are strictly banned inside the arena.\n4. Teams must bring their own tennis cricket balls.`,
    },
    {
      name: 'Royal Strikers Box Cricket',
      address: 'Opposite Drive-In Cinema, Thaltej Road, Ahmedabad',
      mapLocationUrl: 'https://maps.google.com/?q=23.0485,72.5186',
      description: 'Spacious box cricket venue featuring shock-absorbing turf, electronic scoreboard, covered spectator dugout, and ample parking.',
      images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000'],
      weekdayPrice: 1800,
      weekendPrice: 2800,
      timeSlots: ['7:00 AM - 10:30 AM', '2:30 PM - 5:50 PM'],
      hasParking: true,
      hasCharging: true,
      hasFirstAid: true,
      hasDugout: true,
      hasWashroom: true,
      hasChangingRoom: true,
      contactName: 'Vikram Patel',
      contactPhone: '+919812345678',
      rules: `1. Flat sports shoes or turf shoes mandatory.\n2. Maintain discipline; abusive language on the field is prohibited.\n3. Slot timings must be strictly respected.\n4. Advance booking fee is non-refundable.`,
    },
    {
      name: 'Champions Turf Arena',
      address: 'Near Rajpath Club, Bodakdev, Ahmedabad',
      mapLocationUrl: 'https://maps.google.com/?q=23.0360,72.5080',
      description: 'State-of-the-art enclosed box cricket stadium with double-layered safety net, night floodlights, and refreshment lounge.',
      images: ['https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?q=80&w=1000'],
      weekdayPrice: 2000,
      weekendPrice: 3000,
      timeSlots: ['7:00 AM - 10:30 AM', '2:30 PM - 5:50 PM'],
      hasParking: true,
      hasCharging: true,
      hasFirstAid: true,
      hasDugout: true,
      hasWashroom: true,
      hasChangingRoom: true,
      contactName: 'Amit Sharma',
      contactPhone: '+919988776655',
      rules: `1. Only soft/heavy tennis balls permitted.\n2. Maximum 16 players allowed per slot.\n3. Keep the dugout and surroundings clean.`,
    },
  ];

  for (const ground of grounds) {
    const existing = await prisma.cricketGround.findFirst({
      where: { name: ground.name },
    });
    if (!existing) {
      await prisma.cricketGround.create({ data: ground });
      console.log(`✅ Created ground: ${ground.name}`);
    } else {
      console.log(`ℹ️ Ground already exists: ${ground.name}`);
    }
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
