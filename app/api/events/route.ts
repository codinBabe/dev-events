import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Event } from "@/database";
import connectDB from "@/lib/mongodb";

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "DevEvent",
          },
          (error, result) => {
            if (error) return reject(error);

            resolve(result);
          }
        )
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    // Remove problematic fields before spreading
    const { image: _imageFile, tags: _tagsString, agenda: _agendaString, ...eventData } = event;
    
    const createdEvent = await Event.create({
      ...eventData,
      tags: tags,
      agenda: agenda,
    });

    return NextResponse.json(
      {
        message: "Event Created Successfully",
        event: createdEvent,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Event creation failed:", e instanceof Error ? e.message : "Unknown error");
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        ...(process.env.NODE_ENV === "development" && {
          error: e instanceof Error ? e.message : "Unknown",
        }),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Events fetched Successfully",
        events,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Event fetching failed:", process.env.NODE_ENV !== "production" && e instanceof Error ? e.stack : "An error occurred");
    return NextResponse.json(
      {
        message: "Event fetching failed",
      },
      { status: 500 }
    );
  }
}
