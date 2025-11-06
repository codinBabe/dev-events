"use client";

import { createBooking } from "@/lib/actions/booking.action";
import posthog from "posthog-js";
import { useState } from "react";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { success } = await createBooking({
      eventId,
      slug,
      email,
    });
    if (success) {
      setSubmitted(true);
      posthog.capture("event_booked", { eventId, slug, email });
    } else {
      console.error("Booking failed");
      posthog.captureException("Booking failed");
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for booking!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          <button type="submit" className="button-submit">
            Book Event
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
