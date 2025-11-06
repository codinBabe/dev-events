import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database";
import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid Form Data" },
        { status: 400 }
      );
    }

    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        {
          message: "Image file is required",
        },
        { status: 400 }
      );
    }

    let tags, agenda;
    try {
      const tagsData = formData.get("tags");
      const agendaData = formData.get("agenda");

      if (!tagsData || !agendaData) {
        return NextResponse.json(
          { message: "Tags and agenda are required" },
          { status: 400 }
        );
      }

      tags = JSON.parse(tagsData as string);
      agenda = JSON.parse(agendaData as string);
    } catch (e) {
      return NextResponse.json(
        { message: "Invalid JSON format for tags or agenda" },
        { status: 400 }
      );
    }

    event.image = await uploadImageToCloudinary(file);

    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda,
    });

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    // Parse and validate pagination parameters
    const DEFAULT_PAGE = 1;
    const DEFAULT_LIMIT = 20;
    const MAX_LIMIT = 100;

    let page = parseInt(searchParams.get("page") || String(DEFAULT_PAGE), 10);
    let limit = parseInt(
      searchParams.get("limit") || String(DEFAULT_LIMIT),
      10
    );

    // Validate and constrain values
    if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
    if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const skip = (page - 1) * limit;

    // Fetch events with pagination
    const [events, totalCount] = await Promise.all([
      Event.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Event.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        message: "Events fetched Successfully",
        events,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(
      "Event fetching failed:",
      process.env.NODE_ENV !== "production" && e instanceof Error
        ? e.stack
        : "An error occurred"
    );
    return NextResponse.json(
      {
        message: "Event fetching failed",
      },
      { status: 500 }
    );
  }
}
