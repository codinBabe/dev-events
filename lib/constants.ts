export type DevEvent = {
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  slug: string;
};

export const events: DevEvent[] = [
  {
    title: "React Summit 2026",
    date: "Mar 24-25, 2026",
    time: "09:00 - 18:00",
    location: "Amsterdam, Netherlands",
    image: "/images/event1.png",
    slug: "react-summit-2026",
  },
  {
    title: "JSConf EU 2026",
    date: "Apr 14-16, 2026",
    time: "09:30 - 17:30",
    location: "Berlin, Germany",
    image: "/images/event2.png",
    slug: "jsconf-eu-2026",
  },
  {
    title: "Google I/O 2026",
    date: "May 12-14, 2026",
    time: "10:00 - 18:00",
    location: "Mountain View, CA, USA",
    image: "/images/event3.png",
    slug: "google-io-2026",
  },
  {
    title: "ETHGlobal Hackathon (Summer) 2026",
    date: "Jun 20-23, 2026",
    time: "All day",
    location: "Virtual & Paris, France",
    image: "/images/event4.png",
    slug: "ethglobal-summer-2026",
  },
  {
    title: "NodeConf EU 2026",
    date: "Sep 8-9, 2026",
    time: "09:00 - 17:00",
    location: "Lisbon, Portugal",
    image: "/images/event5.png",
    slug: "nodeconf-eu-2026",
  },
  {
    title: "HackMIT 2026",
    date: "Nov 7-9, 2026",
    time: "Fri 18:00 - Sun 20:00",
    location: "Cambridge, MA, USA",
    image: "/images/event6.png",
    slug: "hackmit-2026",
  },
  {
    title: "React Native EU 2026",
    date: "Oct 5, 2026",
    time: "09:30 - 17:00",
    location: "Barcelona, Spain",
    image: "/images/event1.png",
    slug: "react-native-eu-2026",
  },
  {
    title: "Open Source Summit 2026",
    date: "Nov 15-17, 2026",
    time: "09:00 - 18:00",
    location: "Portland, OR, USA",
    image: "/images/event2.png",
    slug: "open-source-summit-2026",
  },
];

export default events;
