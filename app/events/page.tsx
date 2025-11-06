import EventCard from "@/components/event-card";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not configured');
}

const page = async () => {

const page = async () => {
  "use cache";
  cacheLife("hours");

  const response = await fetch(`${BASE_URL}/api/events`);
  
  if (!response.ok) {
    console.error(`Failed to fetch events: ${response.status} ${response.statusText}`);
    return (
      <section id="event-page">
        <h1>All Events</h1>
        <p className="mt-8 text-center">Failed to load events. Please try again later.</p>
      </section>
    );
  }
  
  const data = await response.json();
  const events = data.events || [];

  return (
    <section id="event-page">
      <h1>All Events</h1>
      <div className="mt-20">
        <ul className="events list-none">
          {events &&
            events.length > 0 &&
            events.map((event: IEvent) => (
              <li key={event.title}>
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
