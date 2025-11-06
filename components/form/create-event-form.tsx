"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEvent } from "@/lib/actions/event.action";

const eventSchema = z.object({
  title: z.string().min(2, "Title required"),
  overview: z.string().min(10, "Overview required").max(500),
  venue: z.string().min(1, "Venue required"),
  date: z.string().min(1, "Date required"),
  time: z.string().min(1, "Time required"),
  mode: z.string().min(1, "Mode required"),
  audience: z.string().min(1, "Audience required"),
  agenda: z.string().min(1, "Agenda required"),
  tags: z.string().optional(),
  organizer: z.string().min(1, "Organizer required"),
  location: z.string().min(1, "Location required"),
  description: z.string().min(10, "Description required").max(5000),
});

type EventFormValues = z.infer<typeof eventSchema>;

const CreateEventForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      overview: "",
      venue: "",
      date: "",
      time: "",
      mode: "",
      tags: "",
      audience: "",
      agenda: "",
      organizer: "",
      location: "",
      description: "",
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewSrc(String(reader.result));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewSrc(null);
    }
  }

  async function onSubmit(data: EventFormValues) {
    setStatus("loading");
    try {
      const formData = new FormData();

      const scalarKeys: (keyof EventFormValues)[] = [
        "title",
        "overview",
        "audience",
        "venue",
        "date",
        "time",
        "mode",
        "organizer",
        "location",
        "description",
        "agenda",
        "tags",
      ];

      scalarKeys.forEach((key) => {
        const value = data[key];
        if (typeof value === "string") {
          formData.append(key, value);
        }
      });

      // Append image file
      if (!selectedFile) {
        setStatus("idle");
        setImageError("Event image is required.");
        return;
      }
      setImageError(null);
      formData.append("image", selectedFile);

      const response = await createEvent(formData);
      setStatus(response.success ? "success" : "error");

      if (response.success) {
        reset();
        setPreviewSrc(null);
        setSelectedFile(null);

        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="event-title">Event Title</label>
        <input
          {...register("title")}
          type="text"
          id="event-title"
          name="title"
          placeholder="Enter event title"
        />
        {errors.title && (
          <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="event-overview">Event Overview</label>
        <textarea
          {...register("overview")}
          id="event-overview"
          name="overview"
          placeholder="Enter event overview"
        />
        {errors.overview && (
          <p className="text-xs text-red-400 mt-1">{errors.overview.message}</p>
        )}
      </div>

      <div className="relative">
        <label htmlFor="event-date">Event Date</label>
        <input
          {...register("date")}
          type="date"
          id="event-date"
          name="date"
          className="pl-10"
          aria-label="Event date"
        />
        {errors.date && (
          <p className="text-xs text-red-400 mt-1">{errors.date.message}</p>
        )}
      </div>

      <div className="relative">
        <label htmlFor="event-time">Event Time</label>
        <input
          {...register("time")}
          type="time"
          id="event-time"
          name="time"
          className="pl-10"
          aria-label="Event time"
        />
        {errors.time && (
          <p className="text-xs text-red-400 mt-1">{errors.time.message}</p>
        )}
      </div>

      <div className="relative">
        <label htmlFor="event-location">Event Location</label>
        <input
          {...register("location")}
          type="text"
          id="event-location"
          name="location"
          className="pl-10"
          placeholder="Enter venue or online link"
        />
        {errors.location && (
          <p className="text-xs text-red-400 mt-1">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="event-mode">Mode</label>
        <select {...register("mode")} id="event-mode" name="mode">
          <option value="">Select mode</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="hybrid">Hybrid</option>
        </select>
        {errors.mode && (
          <p className="text-xs text-red-400 mt-1">{errors.mode.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm">Event Image / Banner</label>

        <input
          hidden
          ref={fileInputRef}
          type="file"
          id="event-image"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
        />

        <div
          role="button"
          tabIndex={0}
          className="upload-placeholder"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              fileInputRef.current?.click();
          }}
        >
          {!previewSrc ? (
            <>
              <div className="flex flex-row items-center justify-center gap-2">
                <Image
                  src="/icons/upload-cloud.svg"
                  alt="Upload Icon"
                  width={20}
                  height={20}
                />
                <p className="text-sm">Upload event image or banner</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src={previewSrc}
                alt="preview"
                className="max-h-28 rounded-md object-cover"
              />
              <div>
                <p className="text-sm">Selected image</p>
                <p className="text-xs text-gray-400">{selectedFile?.name}</p>
              </div>
            </div>
          )}
          {imageError && (
            <p className="text-xs text-red-400 mt-1">{imageError}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="tags">Tags</label>
        <input
          {...register("tags")}
          type="text"
          id="tags"
          name="tags"
          placeholder="Add tags such as react, next, js"
        />
      </div>

      <div>
        <label htmlFor="event-venue">Event Venue</label>
        <input
          {...register("venue")}
          type="text"
          id="event-venue"
          name="venue"
          placeholder="Enter event venue"
        />
        {errors.venue && (
          <p className="text-xs text-red-400 mt-1">{errors.venue.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="event-audience">Event Audience</label>
        <input
          {...register("audience")}
          type="text"
          id="event-audience"
          name="audience"
          placeholder="Enter event audience"
        />
        {errors.audience && (
          <p className="text-xs text-red-400 mt-1">{errors.audience.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="event-agenda">Event Agenda</label>
        <textarea
          rows={8}
          {...register("agenda")}
          id="event-agenda"
          name="agenda"
          placeholder="Enter event agenda items"
        />
        {errors.agenda && (
          <p className="text-xs text-red-400 mt-1">{errors.agenda.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="event-organizer">Event Organizer</label>
        <input
          {...register("organizer")}
          type="text"
          id="event-organizer"
          name="organizer"
          placeholder="About the organizer"
        />
        {errors.organizer && (
          <p className="text-xs text-red-400 mt-1">
            {errors.organizer.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="event-description">Event Description</label>
        <textarea
          {...register("description")}
          rows={5}
          id="event-description"
          name="description"
          placeholder="Briefly describe the event"
        />
      </div>

      {status === "success" && (
        <p className="text-green-500 text-center">
          Event created successfully!
        </p>
      )}
      {status === "error" && (
        <p className="text-red-500 text-center">Error creating event!</p>
      )}

      <button type="submit" className="button-submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Create Event"}
      </button>
    </form>
  );
};

export default CreateEventForm;
