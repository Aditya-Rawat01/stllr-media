import { db } from "./lib/db/index.ts";
import { bookings, services } from "./lib/db/schema.ts";

const customerNames = [
  "Nike India", "Netflix India", "Adobe Creative", "Flipkart Studios",
  "HDFC Insurance", "ICICI Bank", "Hindustan Unilever", "Hero MotoCorp",
  "Myntra", "OnePlus India", "Tata Consumer", "Swiggy",
];
const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune"];
const locations = ["Film City", "ND Studio", "Filmistan", "Lonavala", "Bandra", "Powai"];

function pick(values) {
  return values[Math.floor(Math.random() * values.length)];
}

const allServices = await db.select().from(services);
if (allServices.length === 0) {
  throw new Error("No services found. Seed services before past bookings.");
}

const pastBookings = Array.from({ length: 14 }, (_, index) => {
  const customerName = customerNames[index % customerNames.length];
  const day = 2 + Math.floor(Math.random() * 27);
  const startHour = 8 + Math.floor(Math.random() * 9);
  const duration = 2 + Math.floor(Math.random() * 5);
  const bookingDate = new Date(2026, 7, day, startHour, 0, 0);

  return {
    serviceId: pick(allServices).id,
    customerEmail: `${customerName.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@brand.com`,
    customerName,
    customerPhone: `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`,
    bookingDate,
    startTime: `${String(startHour).padStart(2, "0")}:00`,
    endTime: `${String(Math.min(startHour + duration, 22)).padStart(2, "0")}:00`,
    status: "completed",
    location: pick(locations),
    city: pick(cities),
    notes: `Completed August project for ${customerName}`,
  };
});

await db.insert(bookings).values(pastBookings);
console.log(`Inserted ${pastBookings.length} past August bookings.`);
process.exit(0);
