import EventCard from "@/components/event-card";
import { IEvent } from "@/database";
import { getAllEvents } from "@/lib/actions/event.action";
import { cacheLife } from "next/cache";

const page = async () => {
  "use cache";
  cacheLife("hours");

  let events: IEvent[] = [];

  try {
    events = (await getAllEvents()) as unknown as IEvent[];
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return (
      <section id="event-page">
        <h1>All Events</h1>
        <p className="mt-8 text-center">
          Failed to load events. Please try again later.
        </p>
      </section>
    );
  }

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
