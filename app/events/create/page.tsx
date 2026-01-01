"use client";

import React, { useTransition } from "react";

const CreateEventPage = () => {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        // Dynamically import the server action to avoid evaluation during static generation
        const { createEventAction } = await import(
          "@/lib/actions/event.actions"
        );
        await createEventAction(formData);
      } catch (error) {
        console.error("Failed to create event:", error);
        // You could add error handling UI here
        alert("Failed to create event. Please try again.");
      }
    });
  };

  return (
    <section id="event">
      <div className="header">
        <p className="section-label">Host a new event</p>
        <h1>Create a tech event</h1>
        <p>
          Share your hackathon, meetup or conference with the TechHub community.
        </p>
      </div>

      <div className="details">
        <div className="content">
          <form
            id="create-event-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            <section className="section-shell flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <div className="field-group flex-1">
                  <label htmlFor="title">Event title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Tech Hub Community Meetup"
                    required
                  />
                </div>

                <div className="field-group flex-1">
                  <label htmlFor="organizer">Organizer</label>
                  <input
                    id="organizer"
                    name="organizer"
                    type="text"
                    placeholder="Your community or company"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="description">Short description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="A concise description that will appear in listings."
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="overview">Detailed overview</label>
                <textarea
                  id="overview"
                  name="overview"
                  rows={5}
                  placeholder="What can attendees expect from this event?"
                  required
                />
              </div>
            </section>

            <section className="section-shell flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <div className="field-group flex-1">
                  <label htmlFor="date">Date</label>
                  <input id="date" name="date" type="date" required />
                </div>
                <div className="field-group flex-1">
                  <label htmlFor="time">Time</label>
                  <input id="time" name="time" type="time" required />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <div className="field-group flex-1">
                  <label htmlFor="venue">Venue</label>
                  <input
                    id="venue"
                    name="venue"
                    type="text"
                    placeholder="Venue name or building"
                    required
                  />
                </div>
                <div className="field-group flex-1">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="City, Country or online link"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <div className="field-group flex-1">
                  <label htmlFor="mode">Mode</label>
                  <input
                    id="mode"
                    name="mode"
                    type="text"
                    placeholder="In-person, Online, Hybrid"
                    required
                  />
                </div>
                <div className="field-group flex-1">
                  <label htmlFor="audience">Audience</label>
                  <input
                    id="audience"
                    name="audience"
                    type="text"
                    placeholder="Developers, designers, founders, etc."
                    required
                  />
                </div>
              </div>
            </section>

            <section className="section-shell flex flex-col gap-4">
              <div className="field-group">
                <label htmlFor="image">Cover image URL</label>
                <input
                  id="image"
                  name="image"
                  type="url"
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="agenda">Agenda (one item per line)</label>
                <textarea
                  id="agenda"
                  name="agenda"
                  rows={4}
                  placeholder={
                    "18:00 - Check-in\n18:30 - Opening keynote\n19:15 - Lightning talks"
                  }
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  placeholder="javascript, devtools, ai, design"
                  required
                />
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                className="primary-submit-btn"
                disabled={isPending}
              >
                {isPending ? "Publishing..." : "Publish event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreateEventPage;
