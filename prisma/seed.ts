import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { destinationHero, destinationGallery, avatarUrl, hikeImage } from "../lib/images";
import { slugify } from "../lib/utils";
import {
  destinations,
  HIKER_INTERESTS,
  GUIDE_LANGUAGES,
  GUIDE_SPECIALTIES,
  HIKER_NAMES,
  GUIDE_NAMES,
} from "./seed-data";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123!";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickMany<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(randomInt(5, 8), pick([0, 15, 30, 45]), 0, 0);
  return d;
}
function emailFor(name: string, domain = "example.com") {
  return `${slugify(name).replace(/-/g, ".")}@${domain}`;
}
function usernameFor(name: string, suffix: number) {
  return `${slugify(name).replace(/-/g, "_")}${suffix}`;
}

async function main() {
  console.log("Seeding TrailLink Nepal — development/demo data only.");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Clear existing data (idempotent local re-seeding) --------------------
  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.conversationParticipant.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.report.deleteMany(),
    prisma.block.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.review.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.adventureGroupMember.deleteMany(),
    prisma.adventureGroup.deleteMany(),
    prisma.adventureMatch.deleteMany(),
    prisma.hikeParticipant.deleteMany(),
    prisma.hike.deleteMany(),
    prisma.availability.deleteMany(),
    prisma.guideVerification.deleteMany(),
    prisma.guideProfile.deleteMany(),
    prisma.hikerProfile.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.itineraryDay.deleteMany(),
    prisma.trail.deleteMany(),
    prisma.destination.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // --- Destinations -----------------------------------------------------
  const createdDestinations = [];
  for (const d of destinations) {
    const destination = await prisma.destination.create({
      data: {
        slug: d.slug,
        name: d.name,
        region: d.region,
        summary: d.summary,
        description: d.description,
        difficulty: d.difficulty,
        durationDays: d.durationDays,
        elevationM: d.elevationM,
        bestSeason: d.bestSeason,
        budgetMinUsd: d.budgetMinUsd,
        budgetMaxUsd: d.budgetMaxUsd,
        latitude: d.latitude,
        longitude: d.longitude,
        heroImage: destinationHero(d.slug),
        gallery: destinationGallery(d.slug, 6),
        highlights: d.highlights,
        safetyInfo: d.safetyInfo,
        ratingAvg: 0,
        ratingCount: 0,
        popularity: randomInt(20, 100),
        itinerary: { create: d.itinerary },
        trail: {
          create: {
            meetingPoint: d.meetingPoint,
            distanceKm: d.distanceKm,
            elevationGainM: d.elevationGainM,
            elevationLossM: d.elevationLossM,
            routePoints: [
              { lat: d.latitude - 0.06, lng: d.longitude - 0.05, label: d.meetingPoint },
              { lat: d.latitude - 0.03, lng: d.longitude - 0.02, label: "Trail checkpoint" },
              { lat: d.latitude - 0.01, lng: d.longitude - 0.01, label: "High camp" },
              { lat: d.latitude, lng: d.longitude, label: d.name },
            ],
            waypoints: [
              { name: d.meetingPoint, lat: d.latitude - 0.06, lng: d.longitude - 0.05, description: "Trailhead / starting point" },
              { name: d.name, lat: d.latitude, lng: d.longitude, description: "Destination high point" },
            ],
          },
        },
      },
    });
    createdDestinations.push(destination);
  }
  console.log(`Created ${createdDestinations.length} destinations.`);

  // --- Admin --------------------------------------------------------------
  const admin = await prisma.user.create({
    data: {
      email: "admin@traillinknepal.dev",
      username: "admin",
      name: "TrailLink Admin",
      passwordHash,
      role: "ADMIN",
      image: avatarUrl("admin"),
    },
  });

  // --- Hikers ---------------------------------------------------------------
  const hikers = [];
  for (let i = 0; i < HIKER_NAMES.length; i++) {
    const name = HIKER_NAMES[i];
    const isAvi = name === "Avi Gurung";
    const user = await prisma.user.create({
      data: {
        email: emailFor(name),
        username: isAvi ? "avi" : usernameFor(name, i),
        name: isAvi ? "Avi" : name,
        passwordHash,
        role: "HIKER",
        image: avatarUrl(name),
        hikerProfile: {
          create: {
            bio: isAvi
              ? "Weekend hiker exploring the hills around Kathmandu, always looking for a sunrise viewpoint and new trail friends."
              : `Nepal-based hiker who loves ${pick(HIKER_INTERESTS).toLowerCase()} and getting outdoors whenever possible.`,
            location: pick(["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Chitwan", "Dharan"]),
            experienceLevel: isAvi ? "BEGINNER" : pick(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
            preferredDifficulty: isAvi ? "MODERATE" : pick(["EASY", "MODERATE", "CHALLENGING"]),
            interests: pickMany(HIKER_INTERESTS, randomInt(2, 4)),
            badges: isAvi ? ["Early Bird", "5 Trails Club"] : randomInt(0, 1) ? ["First Summit"] : [],
          },
        },
      },
    });
    hikers.push(user);
  }
  const avi = hikers.find((h) => h.username === "avi")!;
  console.log(`Created ${hikers.length} hiker accounts.`);

  // --- Guides -----------------------------------------------------------
  const guides = [];
  for (let i = 0; i < GUIDE_NAMES.length; i++) {
    const name = GUIDE_NAMES[i];
    const verificationStatus = i < 7 ? "VERIFIED" : i === 7 ? "PENDING" : i === 8 ? "PENDING" : "REJECTED";
    const languages = pickMany(GUIDE_LANGUAGES, randomInt(2, 4));
    const specialties = pickMany(GUIDE_SPECIALTIES, randomInt(2, 3));
    const destinationsCovered = pickMany(createdDestinations, randomInt(3, 6)).map((d) => d.slug);

    const user = await prisma.user.create({
      data: {
        email: emailFor(name),
        username: usernameFor(name, i),
        name,
        passwordHash,
        role: "GUIDE",
        image: avatarUrl(name),
        guideProfile: {
          create: {
            bio: `Licensed trekking guide based in ${pick(["Lukla", "Pokhara", "Kathmandu", "Namche Bazaar"])} with ${randomInt(3, 20)} years on the trail.`,
            location: pick(["Kathmandu", "Pokhara", "Lukla", "Namche Bazaar"]),
            experienceYears: randomInt(3, 20),
            languages,
            specialties,
            destinationsCovered,
            pricePerDay: randomInt(30, 90) * 10,
            verificationStatus,
            tripsCompleted: randomInt(10, 200),
            ratingAvg: 0,
            ratingCount: 0,
            gallery: destinationGallery(`guide-${slugify(name)}`, 4, 900, 700),
            verification: {
              create: {
                fullName: name,
                idType: "Nepal Citizenship",
                idNumber: `NP-${randomInt(100000, 999999)}`,
                experienceDescription: `${randomInt(3, 20)} years guiding treks across ${destinationsCovered.slice(0, 3).join(", ")}.`,
                certifications: ["Wilderness First Aid", "Nepal Mountaineering Association Guide License"],
                documents: verificationStatus === "REJECTED" ? [] : ["/documents/sample-license.pdf"],
                emergencyContactName: pick(HIKER_NAMES),
                emergencyContactPhone: `+977-98${randomInt(10000000, 99999999)}`,
                languages,
                specialties,
                status: verificationStatus,
                reviewNote:
                  verificationStatus === "REJECTED"
                    ? "Submitted documents were incomplete. Please resubmit a valid guide license."
                    : verificationStatus === "VERIFIED"
                      ? "Documents verified against Nepal Mountaineering Association records."
                      : null,
                reviewedById: verificationStatus === "PENDING" ? null : admin.id,
                reviewedAt: verificationStatus === "PENDING" ? null : new Date(),
              },
            },
          },
        },
      },
      include: { guideProfile: true },
    });
    guides.push(user);

    // Availability for the next 30 days
    const availabilityData = Array.from({ length: 30 }, (_, day) => ({
      guideProfileId: user.guideProfile!.id,
      date: daysFromNow(day),
      isAvailable: Math.random() > 0.25,
    }));
    await prisma.availability.createMany({ data: availabilityData });
  }
  console.log(`Created ${guides.length} guide accounts.`);

  const verifiedGuides = guides.filter((_, i) => i < 7);

  // --- Hikes --------------------------------------------------------------
  const hikeTitles = [
    "Sunrise Ridge Hike", "Weekend Trail Escape", "Full Moon Forest Walk", "Monastery Trail Day Trip",
    "Waterfall & Village Loop", "Alpine Meadow Trek", "Photography Trail Walk", "Beginner-Friendly Nature Walk",
    "Sacred Lake Pilgrimage Hike", "Ridge-Top Sunset Hike", "Cloud Forest Adventure", "Tea Garden Ramble",
    "High Camp Overnight", "River Valley Day Hike", "Viewpoint Chasers Hike",
  ];

  const hikes = [];
  for (let i = 0; i < hikeTitles.length; i++) {
    const destination = pick(createdDestinations);
    const isPast = i < 4; // first few are completed trips, used to seed reviews
    const date = isPast ? daysFromNow(-randomInt(10, 60)) : daysFromNow(randomInt(3, 45));
    const host = pick([...hikers, ...guides]);
    const maxParticipants = randomInt(4, 12);
    const isFull = i === 5;

    const hike = await prisma.hike.create({
      data: {
        destinationId: destination.id,
        hostId: host.id,
        title: hikeTitles[i],
        description: `Join us for ${hikeTitles[i].toLowerCase()} at ${destination.name}. A great way to experience ${destination.region} with fellow hikers.`,
        date,
        startTime: `0${randomInt(5, 7)}:${pick(["00", "15", "30"])}`,
        meetingPoint: destination.slug === "shivapuri" ? "Sundarijal gate" : `${destination.region} trailhead`,
        difficulty: destination.difficulty,
        durationHours: randomInt(4, 10),
        maxParticipants,
        price: pick([0, 0, 500, 800, 1200, 2000]),
        images: [hikeImage(`${destination.slug}-${i}`)],
        requirements: ["Reasonable fitness level", "Prior trail experience recommended"],
        equipment: ["Sturdy hiking shoes", "Rain jacket", "Water bottle", "Sun protection"],
        safetyNotes: "Follow the host's pace, carry a headlamp, and inform the group of any medical conditions in advance.",
        status: isPast ? "COMPLETED" : isFull ? "FULL" : "UPCOMING",
      },
    });
    hikes.push(hike);

    // participants
    const participantCount = isFull ? maxParticipants : Math.min(maxParticipants - 1, randomInt(1, 6));
    const participants = pickMany(
      hikers.filter((h) => h.id !== host.id),
      participantCount
    );
    if (isPast || Math.random() > 0.4) participants.push(avi.id === host.id ? participants[0] : avi);
    const uniqueParticipants = [...new Map(participants.filter(Boolean).map((p) => [p.id, p])).values()];

    await prisma.hikeParticipant.createMany({
      data: uniqueParticipants.map((p) => ({ hikeId: hike.id, userId: p.id, status: "JOINED" as const })),
    });

    // group conversation for this hike
    const conversation = await prisma.conversation.create({
      data: {
        type: "GROUP",
        hikeId: hike.id,
        participants: {
          create: [host.id, ...uniqueParticipants.map((p) => p.id)]
            .filter((id, idx, arr) => arr.indexOf(id) === idx)
            .map((userId) => ({ userId })),
        },
      },
    });
    if (isPast) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: host.id,
          content: "Thanks everyone for joining — great trip! Please leave a review when you get a chance.",
        },
      });
    }
  }
  console.log(`Created ${hikes.length} hikes with participants and group chats.`);

  // --- Reviews (for completed hikes) ---------------------------------------
  const completedHikes = hikes.filter((h) => h.status === "COMPLETED");
  for (const hike of completedHikes) {
    const participants = await prisma.hikeParticipant.findMany({ where: { hikeId: hike.id } });
    for (const participant of participants.slice(0, 2)) {
      await prisma.review.create({
        data: {
          authorId: participant.userId,
          targetType: "TRIP",
          hikeId: hike.id,
          rating: randomInt(4, 5),
          comment: pick([
            "Beautiful trail and a well-organized group — would join again!",
            "Great pace for beginners, stunning views at the top.",
            "Loved the group energy, learned a lot about the local trails.",
          ]),
        },
      });
    }
  }

  // --- Guide bookings, payments & reviews ---------------------------------
  for (const guideUser of verifiedGuides.slice(0, 4)) {
    const guideProfile = await prisma.guideProfile.findUnique({ where: { userId: guideUser.id } });
    if (!guideProfile) continue;
    const client = pick(hikers);
    const numberOfPeople = randomInt(1, 3);
    const booking = await prisma.booking.create({
      data: {
        userId: client.id,
        guideProfileId: guideProfile.id,
        numberOfPeople,
        unitPrice: guideProfile.pricePerDay,
        totalPrice: guideProfile.pricePerDay * numberOfPeople,
        status: "COMPLETED",
        tripDate: daysFromNow(-randomInt(5, 40)),
        payment: {
          create: {
            provider: "MOCK",
            amount: guideProfile.pricePerDay * numberOfPeople,
            status: "SUCCESS",
            transactionRef: `MOCK-SEED-${randomInt(100000, 999999)}`,
          },
        },
      },
    });

    await prisma.review.create({
      data: {
        authorId: client.id,
        targetType: "GUIDE",
        targetUserId: guideUser.id,
        bookingId: booking.id,
        rating: randomInt(4, 5),
        comment: "Extremely knowledgeable and safety-conscious guide. Highly recommend for first-time trekkers.",
      },
    });
  }

  // recompute guide ratings from seeded reviews
  for (const guideUser of guides) {
    const agg = await prisma.review.aggregate({
      where: { targetType: "GUIDE", targetUserId: guideUser.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.guideProfile.update({
      where: { userId: guideUser.id },
      data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count.rating },
    });
  }

  // recompute destination ratings from seeded trip reviews
  for (const destination of createdDestinations) {
    const destHikes = hikes.filter((h) => h.destinationId === destination.id).map((h) => h.id);
    if (destHikes.length === 0) continue;
    const agg = await prisma.review.aggregate({
      where: { targetType: "TRIP", hikeId: { in: destHikes } },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.destination.update({
      where: { id: destination.id },
      data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count.rating },
    });
  }

  // --- A pending, unpaid booking for a hike (to exercise booking states) ---
  const upcomingPricedHike = hikes.find((h) => h.price > 0 && h.status === "UPCOMING");
  if (upcomingPricedHike) {
    await prisma.booking.create({
      data: {
        userId: avi.id,
        hikeId: upcomingPricedHike.id,
        numberOfPeople: 1,
        unitPrice: upcomingPricedHike.price,
        totalPrice: upcomingPricedHike.price,
        status: "PENDING",
        tripDate: upcomingPricedHike.date,
      },
    });
  }

  // --- Favorites ------------------------------------------------------------
  const aviFavoriteDestinations = createdDestinations.filter((d) =>
    ["mardi-himal", "poon-hill", "shivapuri"].includes(d.slug)
  );
  await prisma.favorite.createMany({
    data: aviFavoriteDestinations.map((d) => ({ userId: avi.id, type: "DESTINATION" as const, destinationId: d.id })),
  });
  for (const hiker of pickMany(hikers, 6)) {
    const dest = pick(createdDestinations);
    await prisma.favorite
      .create({ data: { userId: hiker.id, type: "DESTINATION", destinationId: dest.id } })
      .catch(() => undefined);
  }

  // --- Adventure matches (Random Adventure / Meet) --------------------------
  for (const hiker of pickMany(hikers, 10)) {
    const maybeDestination = Math.random() > 0.3 ? pick(createdDestinations).id : null;
    await prisma.adventureMatch.create({
      data: {
        userId: hiker.id,
        destinationId: maybeDestination,
        preferredDate: daysFromNow(randomInt(3, 30)),
        difficulty: pick(["EASY", "MODERATE", "CHALLENGING"]),
        experienceLevel: pick(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
        ageRangeMin: 18,
        ageRangeMax: 45,
        groupSizePref: randomInt(2, 8),
        interests: pickMany(HIKER_INTERESTS, randomInt(1, 3)),
      },
    });
  }
  // Avi's own active match request, tuned to guarantee compatible seeded matches
  await prisma.adventureMatch.create({
    data: {
      userId: avi.id,
      destinationId: createdDestinations.find((d) => d.slug === "shivapuri")!.id,
      preferredDate: daysFromNow(6),
      difficulty: "MODERATE",
      experienceLevel: "BEGINNER",
      ageRangeMin: 18,
      ageRangeMax: 40,
      groupSizePref: 4,
      interests: ["Photography", "Sunrise viewpoints"],
    },
  });

  // --- Direct messages -------------------------------------------------------
  const buddy = hikers.find((h) => h.id !== avi.id)!;
  const dmConversation = await prisma.conversation.create({
    data: {
      type: "DIRECT",
      participants: { create: [{ userId: avi.id }, { userId: buddy.id }] },
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: dmConversation.id, senderId: buddy.id, content: "Hey! Saw you're into Shivapuri sunrise hikes too — want to team up this weekend?" },
      { conversationId: dmConversation.id, senderId: avi.id, content: "Yes! I've been wanting to go for weeks. Saturday morning?" },
    ],
  });

  // --- Notifications for Avi (demo account) ----------------------------------
  await prisma.notification.createMany({
    data: [
      {
        userId: avi.id,
        type: "NEW_MESSAGE",
        title: "New message",
        body: `${buddy.name} sent you a message.`,
        link: `/messages/${dmConversation.id}`,
      },
      {
        userId: avi.id,
        type: "ADVENTURE_MATCH",
        title: "You found new hikers!",
        body: "4 hikers match your Shivapuri weekend preferences.",
        link: "/meet",
      },
      {
        userId: avi.id,
        type: "BOOKING_CONFIRMED",
        title: "Booking pending payment",
        body: "Complete payment to confirm your upcoming hike booking.",
        link: "/dashboard",
        isRead: true,
      },
      {
        userId: avi.id,
        type: "HIKE_REMINDER",
        title: "Upcoming hike reminder",
        body: "Your hike is coming up soon — check the meeting point and weather.",
        link: "/hikes",
      },
    ],
  });

  console.log("\nSeed complete.");
  console.log("--------------------------------------------------");
  console.log("Demo accounts (all use the same password):");
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  Admin:    admin@traillinknepal.dev`);
  console.log(`  Hiker:    ${avi.email}  (username: avi)`);
  console.log(`  Guide:    ${guides[0].email}`);
  console.log("--------------------------------------------------\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });