import EventCard from "@/components/event-card";
import ExploreBtn from "@/components/explore-btn";
import { IEvent } from "@/database";
import { getFeaturedEvents } from "@/lib/actions/event.action";
import { cacheLife } from "next/cache";

const Home = async () => {
  "use cache";

  cacheLife("hours");

  const events = (await getFeaturedEvents()) as unknown as IEvent[];

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss.
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, Conferences, All in one Place.
      </p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

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

export default Home;
