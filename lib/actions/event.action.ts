"use server";

import { Event, Booking, IEvent } from "@/database";
import connectDB from "../mongodb";
import { uploadImageToCloudinary } from "../cloudinary";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { ActionResponse, UpdateEventData } from "./dashboard.action";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectDB();

    const event = await Event.findOne({ slug });
    if (!event) {
      return [];
    }

    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();
  } catch (error) {
    console.error(
      "Error fetching similar events:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return [];
  }
};

export const getFeaturedEvents = async () => {
  try {
    await connectDB();

    return await Event.find().sort({ date: 1 }).limit(6).lean();
  } catch (error) {
    console.error(
      "Error fetching featured events:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return [];
  }
};

export const createEvent = async (data: FormData) => {
  try {
    await connectDB();

    const title = data.get("title") as string;
    const overview = data.get("overview") as string;
    const audience = data.get("audience") as string;
    const venue = data.get("venue") as string;
    const date = data.get("date") as string;
    const time = data.get("time") as string;
    const mode = data.get("mode") as string;
    const organizer = data.get("organizer") as string;
    const location = data.get("location") as string;
    const description = data.get("description") as string;

    // Validate required fields
    const requiredFields = {
      title,
      overview,
      audience,
      venue,
      date,
      time,
      mode,
      organizer,
      location,
      description,
    };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === "") {
        return { success: false, error: `${field} is required` };
      }
    }

    const agenda = ((data.get("agenda") as string) || "")
      .split(/[\n,]+/)
      .map((i) => i.trim())
      .filter(Boolean);

    const tags = ((data.get("tags") as string) || "")
      .split(/[\n,]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (agenda.length === 0) {
      return { success: false, error: "At least one agenda item is required" };
    }

    if (tags.length === 0) {
      return { success: false, error: "At least one tag is required" };
    }

    const file = data.get("image") as File;
    if (!file) {
      return { success: false, error: "Image file is required" };
    }

    const image = await uploadImageToCloudinary(file);

    await Event.create({
      title,
      overview,
      audience,
      venue,
      date,
      time,
      mode,
      organizer,
      location,
      description,
      tags,
      agenda,
      image,
    });
    revalidatePath("/events", "page");
    return { success: true };
  } catch (error) {
    console.error(
      "Error creating event:",
      error instanceof Error ? error.message : "Unknown error"
    );
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
};

export const getAllEvents = async () => {
  try {
    await connectDB();

    return await Event.find().sort({ date: -1 }).lean();
  } catch (error) {
    console.error(
      "Error fetching all events:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return [];
  }
};

export async function getEventById(
  eventId: string
): Promise<ActionResponse<Record<string, unknown>>> {
  try {
    if (!Types.ObjectId.isValid(eventId)) {
      return {
        success: false,
        message: "Invalid event ID format",
        error: "INVALID_ID",
      };
    }

    await connectDB();
    const event = await Event.findById(eventId).lean<IEvent>();

    if (!event) {
      return {
        success: false,
        message: "Event not found",
        error: "NOT_FOUND",
      };
    }

    const formattedEvent = {
      ...event,
      _id: event._id.toString(),
    };

    return {
      success: true,
      message: "Event fetched successfully",
      data: formattedEvent,
    };
  } catch (error) {
    console.error(
      "Error fetching event:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      message: "Failed to fetch event",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateEvent(
  eventId: string,
  updateData: UpdateEventData
): Promise<ActionResponse> {
  try {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(eventId)) {
      return {
        success: false,
        message: "Invalid event ID format",
        error: "INVALID_ID",
      };
    }

    // Validate that updateData is not empty
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: "No update data provided",
        error: "EMPTY_UPDATE",
      };
    }

    await connectDB();

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedEvent) {
      return {
        success: false,
        message: "Event not found",
        error: "NOT_FOUND",
      };
    }

    // Revalidate the dashboard and event pages to reflect changes
    revalidatePath("/admin/dashboard", "page");
    revalidatePath(`/events/${updatedEvent.slug}`, "page");
    revalidatePath("/events", "page");
    revalidatePath("/", "page");

    return {
      success: true,
      message: "Event updated successfully",
    };
  } catch (error) {
    console.error(
      "Error updating event:",
      error instanceof Error ? error.message : "Unknown error"
    );

    if (error instanceof Error && error.name === "ValidationError") {
      return {
        success: false,
        message: "Validation error",
        error: error.message,
      };
    }

    return {
      success: false,
      message: "Failed to update event",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteEvent(eventId: string): Promise<ActionResponse> {
  try {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(eventId)) {
      return {
        success: false,
        message: "Invalid event ID format",
        error: "INVALID_ID",
      };
    }

    await connectDB();
    const event = await Event.findById(eventId);

    if (!event) {
      return {
        success: false,
        message: "Event not found",
        error: "NOT_FOUND",
      };
    }

    const session = await Event.startSession();
    session.startTransaction();

    try {
      const bookingDeletionResult = await Booking.deleteMany(
        { eventId: new Types.ObjectId(eventId) },
        { session }
      );

      await Event.findByIdAndDelete(eventId, { session });

      await session.commitTransaction();

      revalidatePath("/admin/dashboard");
      revalidatePath("/events");
      revalidatePath("/");

      return {
        success: true,
        message: `Event deleted successfully. ${bookingDeletionResult.deletedCount} booking(s) also removed.`,
      };
    } catch (txError) {
      await session.abortTransaction();
      throw txError;
    } finally {
      session.endSession();
    }

    revalidatePath("/admin/dashboard", "page");
    revalidatePath("/events", "page");
    revalidatePath("/", "page");

    return {
      success: true,
      message: `Event deleted successfully. ${bookingDeletionResult.deletedCount} booking(s) also removed.`,
    };
  } catch (error) {
    console.error(
      "Error deleting event:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return {
      success: false,
      message: "Failed to delete event",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
