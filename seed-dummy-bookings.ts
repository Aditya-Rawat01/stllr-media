import { db } from "@/lib/db";
import { bookings, services } from "@/lib/db/schema";

async function run() {
    try {
        const allServices = await db.select().from(services);

        if (allServices.length === 0) {
            console.log("No services found. Add services first.");
            process.exit(1);
        }

        // Clear existing bookings
        await db.delete(bookings);

        const now = new Date();
        const dummyBookings = [];

        const customerNames = [
            "Nike India",
            "Netflix India",
            "Tech Corp",
            "Adobe Creative",
            "Flipkart Studios",
            "Amazon Prime",
            "Airbnb India",
            "Uber India",
            "Swiggy",
            "Zomato",
            "ICICI Bank",
            "HDFC Insurance",
            "Hindustan Unilever",
            "ITC Limited",
            "Nestlé India",
            "Hero MotoCorp",
            "Bajaj Auto",
            "Maruti Suzuki",
            "Hyundai India",
            "MG Motors",
            "Apple India",
            "Samsung India",
            "OnePlus India",
            "Realme India",
            "Poco India",
            "Myntra",
            "Nykaa",
            "Unacademy",
            "Byju's",
            "PhonePe",
        ];

        const locations = [
            "Film City",
            "ND Studio",
            "NSIC Grounds",
            "Studio A",
            "Studio B",
            "Filmistan",
            "EastEnd Studio",
            "Lonavala",
            "Alibaug",
            "Bandra",
            "Colaba",
            "Powai",
            "Andheri",
            "Malad",
            "Borivali",
        ];

        const cities = [
            "Mumbai",
            "Delhi",
            "Bangalore",
            "Hyderabad",
            "Chennai",
            "Pune",
        ];
        const statuses = [
            "pending",
            "confirmed",
            "in_progress",
            "completed",
            "cancelled",
        ] as const;

        // Generate bookings for next 60 days
        for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
            const currentDate = new Date(now);
            currentDate.setDate(now.getDate() + dayOffset);

            // Random number of bookings per day (0-4)
            const bookingsPerDay = Math.floor(Math.random() * 4);

            for (let i = 0; i < bookingsPerDay; i++) {
                const startHour = 8 + Math.floor(Math.random() * 10);
                const duration = 2 + Math.floor(Math.random() * 6);
                const endHour = startHour + duration;

                const startTime = `${String(startHour).padStart(2, "0")}:00`;
                const endTime = `${String(Math.min(endHour, 22)).padStart(2, "0")}:00`;

                const randomService =
                    allServices[Math.floor(Math.random() * allServices.length)];
                const randomCustomer =
                    customerNames[
                        Math.floor(Math.random() * customerNames.length)
                    ];
                const randomLocation =
                    locations[Math.floor(Math.random() * locations.length)];
                const randomCity =
                    cities[Math.floor(Math.random() * cities.length)];
                const randomStatus =
                    statuses[Math.floor(Math.random() * statuses.length)];

                dummyBookings.push({
                    serviceId: randomService.id,
                    customerEmail: `${randomCustomer.toLowerCase().replace(/\s+/g, ".")}@brand.com`,
                    customerName: randomCustomer,
                    customerPhone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                    bookingDate: currentDate,
                    startTime,
                    endTime,
                    status: randomStatus,
                    location: randomLocation,
                    city: randomCity,
                    notes: `Booking for ${randomCustomer}`,
                });
            }
        }

        // Insert in batches to avoid SQL query size limit
        const batchSize = 100;
        for (let i = 0; i < dummyBookings.length; i += batchSize) {
            const batch = dummyBookings.slice(i, i + batchSize);
            await db.insert(bookings).values(batch);
            console.log(
                `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dummyBookings.length / batchSize)}`,
            );
        }

        console.log(`✅ Seeded ${dummyBookings.length} dummy bookings`);
        process.exit(0);
    } catch (err) {
        console.error("Error seeding bookings:", err);
        process.exit(1);
    }
}

run();
