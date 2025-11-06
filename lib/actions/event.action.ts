"use server";

import { Event } from "@/database";
import connectDB from "../mongodb";
import { uploadImageToCloudinary } from "../cloudinary";
import { revalidatePath } from "next/cache";

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

    const agenda = ((data.get("agenda") as string) || "")
      .replace(/\n/g, ",")
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const tags = ((data.get("tags") as string) || "")
      .replace(/\n/g, ",")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const file = data.get("image") as File;
    if (!file) {
      throw new Error("Image file is required");
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
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error(
      "Error creating event:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return { success: false, error: (error as Error).message };
  }
};
