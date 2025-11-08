"use client";

import { useState } from "react";
import { EventDashboardData } from "@/lib/actions/dashboard.action";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/lib/actions/event.action";

interface Props {
  events: EventDashboardData[];
  totalPages: number;
  page: number;
}

const Dashboard = ({ events, totalPages, page }: Props) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventDashboardData | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const goToPage = (p: number) => {
    router.push(`/admin/dashboard?page=${p}`);
  };

  const handleDeleteClick = (event: EventDashboardData) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);

    try {
      const response = await deleteEvent(eventToDelete._id);

      if (response.success) {
        setDeleteModalOpen(false);
        setEventToDelete(null);
        router.refresh();
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/admin/login");
      } else {
        alert("Failed to log out. Please try again.");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      alert("An error occurred during logout. Please try again.");
    }
  };

  return (
    <section id="dashboard">
      <div className="dashboard-header">
        <h1 className="text-4xl">Event Management</h1>
        <div className="flex gap-2">
          <Link href="/admin/create-event" className="button-submit">
            Add New Event
          </Link>
          <button className="button-submit" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
      <>
        <div>
          <div className="dashboard-statistics">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Events</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Booking Spots</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>{" "}
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Image
                            src={event.image}
                            alt={event.title}
                            width={40}
                            height={40}
                            className="object-cover rounded"
                          />
                          <div>{event.title}</div>
                        </div>
                      </td>
                      <td>{event.location}</td>
                      <td>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td>{event.time}</td>
                      <td>{event.bookingSpots}</td>

                      <td>
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/admin/dashboard/edit/${event._id}`}
                            className="px-3 py-1.5 text-primary hover:bg-dark-100 transition"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(event)}
                            disabled={isDeleting}
                            className="px-3 py-1.5 hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div id="pagination">
            <button onClick={() => goToPage(page - 1)} disabled={page <= 1}>
              Previous
            </button>

            <span className="text-sm">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && eventToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-dark-200 border border-dark-100 rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="shrink-0 bg-red-100 rounded-full p-3 mr-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Delete Event</h3>
              </div>
              <p className="mb-2">
                Are you sure you want to delete{" "}
                <strong>{eventToDelete.title}</strong>?
              </p>
              <p className="text-sm mb-6">
                This action cannot be undone. All bookings (
                {eventToDelete.bookingSpots}) associated with this event will
                also be deleted.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-dark-200 rounded hover:bg-gray-50 hover:text-black transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete Event"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </section>
  );
};

export default Dashboard;
