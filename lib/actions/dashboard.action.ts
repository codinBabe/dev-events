"use server";

import { Booking, Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { Types } from "mongoose";

export interface EventDashboardData {
  _id: string;
  title: string;
  image: string;
  location: string;
  date: string;
  time: string;
  bookingSpots: number;
}

export interface DashboardStatistics {
  events: EventDashboardData[];
  totalEvents: number;
  totalBookings: number;
  totalPages: number;
  page: number;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  overview?: string;
  image?: string;
  venue?: string;
  location?: string;
  date?: string;
  time?: string;
  mode?: "online" | "offline" | "hybrid";
  audience?: string;
  agenda?: string[];
  organizer?: string;
  tags?: string[];
}

export interface ActionResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export async function getEventsDashboardData({
  page = 1,
  limit = 10,
}: {
  page: number;
  limit: number;
}): Promise<DashboardStatistics> {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    const eventsWithBookings = await Event.aggregate<{
      _id: Types.ObjectId | string;
      title: string;
      image: string;
      location: string;
      date: string;
      time: string;
      bookingSpots: number;
    }>([
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "eventId",
          as: "bookings",
        },
      },
      {
        $addFields: {
          bookingSpots: { $size: "$bookings" },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          image: 1,
          location: 1,
          date: 1,
          time: 1,
          bookingSpots: 1,
        },
      },
      {
        $sort: { date: -1 },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const formattedEvents: EventDashboardData[] = eventsWithBookings.map(
      (event) => ({
        _id: event._id.toString(),
        title: event.title,
        image: event.image,
        location: event.location,
        date: event.date,
        time: event.time,
        bookingSpots: event.bookingSpots,
      })
    );

    // Calculate total pages
    const totalEventsCount = await Event.countDocuments();
    const totalPages = Math.ceil(totalEventsCount / limit);

    // Calculate total bookings across all events
    const totalBookings = await Booking.countDocuments();

    return {
      events: formattedEvents,
      totalEvents: totalEventsCount,
      totalBookings,
      totalPages,
      page,
    };
  } catch (error) {
    console.error(
      "Error fetching dashboard data:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Re-throw error to be handled by the calling component
    throw new Error("Failed to fetch dashboard data");
  }
}

export async function getEventStatistics(
  eventId: string
): Promise<EventDashboardData | null> {
  try {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid event ID format");
    }

    await connectDB();

    const objectId = new Types.ObjectId(eventId);

    const result = await Event.aggregate<{
      _id: Types.ObjectId;
      title: string;
      image: string;
      location: string;
      date: string;
      time: string;
      bookingSpots: number;
    }>([
      {
        // Filter for specific event
        $match: { _id: objectId },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "eventId",
          as: "bookings",
        },
      },
      {
        $addFields: {
          bookingSpots: { $size: "$bookings" },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          image: 1,
          location: 1,
          date: 1,
          time: 1,
          bookingSpots: 1,
        },
      },
    ]);

    if (result.length === 0) {
      return null;
    }

    return {
      _id: result[0]._id.toString(),
      title: result[0].title,
      image: result[0].image,
      location: result[0].location,
      date: result[0].date,
      time: result[0].time,
      bookingSpots: result[0].bookingSpots,
    };
  } catch (error) {
    console.error(
      "Error fetching event statistics:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw new Error("Failed to fetch event statistics");
  }
}
