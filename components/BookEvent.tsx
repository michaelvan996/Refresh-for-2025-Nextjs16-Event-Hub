"use client";
import React, { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";
import { emailSchema } from "@/lib/validations";
import LoadingSpinner from "./LoadingSpinner";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Client-side validation
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
      setError(
        validationResult.error.errors[0]?.message || "Invalid email address"
      );
      setLoading(false);
      return;
    }

    try {
      const result = await createBooking({ eventId, slug, email });

      if (result.success) {
        setSubmitted(true);
        setEmail("");
      } else {
        setError(result.error || "Failed to book event. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Booking creation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <div className="rounded-lg bg-primary/10 border border-primary/30 p-4">
          <p className="text-sm font-medium text-primary">
            Thank you for signing up!
          </p>
          <p className="text-xs text-light-200 mt-1">
            We'll send you event details soon.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setError(null);
            }}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Book another event
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              id="email"
              placeholder="Enter your email address"
              required
              disabled={loading}
              className={error ? "border-red-500 focus:border-red-500" : ""}
              aria-invalid={!!error}
              aria-describedby={error ? "email-error" : undefined}
            />
            {error && (
              <p
                id="email-error"
                className="text-red-400 text-xs mt-1"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="button-submit"
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Booking...
              </span>
            ) : (
              "Book Event"
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
