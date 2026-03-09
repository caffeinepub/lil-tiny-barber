import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Loader2,
  LogOut,
  RefreshCw,
  Scissors,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { BookingStatus } from "../backend";
import { useActor } from "../hooks/useActor";

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
}

interface StaffSession {
  id: string;
  staffName: string;
  salonName: string;
  address: string;
  mobile: string;
}

interface Booking {
  id: bigint;
  customerName: string;
  customerMobile: string;
  service: string;
  timeSlot: string;
  status: BookingStatus;
  createdAt: bigint;
  salonId: bigint;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"today" | "all">("today");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("litinybarber_staff");
    if (!stored) {
      onNavigate("staff-login");
      return;
    }
    try {
      setSession(JSON.parse(stored));
    } catch {
      onNavigate("staff-login");
    }
  }, [onNavigate]);

  const fetchBookings = useCallback(async () => {
    if (!actor || !session || actorFetching) return;
    setLoading(true);
    try {
      const data = await actor.getBookingsBySalon(BigInt(session.id));
      setBookings(data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [actor, session, actorFetching]);

  useEffect(() => {
    if (session && actor && !actorFetching) {
      fetchBookings();
    }
  }, [session, actor, actorFetching, fetchBookings]);

  const handleLogout = () => {
    localStorage.removeItem("litinybarber_staff");
    toast.success("Logged out successfully");
    onNavigate("home");
  };

  const handleUpdateStatus = async (
    bookingId: bigint,
    status: BookingStatus,
  ) => {
    if (!actor) return;
    const idStr = bookingId.toString();
    setUpdatingId(idStr);
    try {
      const success = await actor.updateBookingStatus(bookingId, status);
      if (success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
        );
        toast.success(
          `Booking ${status === BookingStatus.completed ? "completed" : "cancelled"}`,
        );
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  };

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    const today = getTodayString();
    return b.timeSlot.startsWith(today);
  });

  const formatSlot = (slot: string) => {
    const parts = slot.split(" ");
    if (parts.length === 2) return `${parts[0]} at ${parts[1]}`;
    return slot;
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.completed:
        return (
          <Badge className="bg-green-900/50 text-green-300 border border-green-700/50 hover:bg-green-900/50">
            {status}
          </Badge>
        );
      case BookingStatus.cancelled:
        return (
          <Badge className="bg-red-900/50 text-red-300 border border-red-700/50 hover:bg-red-900/50">
            {status}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-900/50 text-yellow-300 border border-yellow-700/50 hover:bg-yellow-900/50">
            {status}
          </Badge>
        );
    }
  };

  const stats = {
    total: bookings.length,
    today: bookings.filter((b) => b.timeSlot.startsWith(getTodayString()))
      .length,
    pending: bookings.filter((b) => b.status === BookingStatus.pending).length,
    completed: bookings.filter((b) => b.status === BookingStatus.completed)
      .length,
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                <Scissors className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h1
                  className="font-bold text-sm leading-tight"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  {session.salonName}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {session.staffName}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              data-ocid="dashboard.link"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-lg hover:bg-muted"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", value: stats.total, icon: Users },
            { label: "Today", value: stats.today, icon: Clock },
            { label: "Pending", value: stats.pending, icon: Clock },
            { label: "Done", value: stats.completed, icon: CheckCircle },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <Icon className="w-4 h-4 text-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter & Refresh */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-card border border-border rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setFilter("today")}
              data-ocid="dashboard.tab"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === "today"
                  ? "bg-gold text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              data-ocid="dashboard.tab"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === "all"
                  ? "bg-gold text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Bookings
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookings}
            disabled={loading}
            data-ocid="dashboard.secondary_button"
            className="border-border hover:border-gold/50 gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="dashboard.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div
            className="text-center py-20 border border-dashed border-border rounded-2xl"
            data-ocid="dashboard.empty_state"
          >
            <div className="text-5xl mb-4">💈</div>
            <p className="font-semibold text-foreground">No bookings yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === "today"
                ? "No bookings for today"
                : "Your booking list is empty"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking, idx) => (
              <div
                key={booking.id.toString()}
                data-ocid={`dashboard.row.${idx + 1}`}
                className="bg-card border border-border rounded-xl p-4 hover:border-gold/20 transition-colors"
              >
                {/* Mobile-friendly card layout */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground truncate">
                        {booking.customerName}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.customerMobile}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gold font-medium">
                      {formatSlot(booking.timeSlot)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {booking.service}
                    </div>
                  </div>
                </div>

                {/* Service details */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {booking.service}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      booking.status !== BookingStatus.pending ||
                      updatingId === booking.id.toString()
                    }
                    onClick={() =>
                      handleUpdateStatus(booking.id, BookingStatus.completed)
                    }
                    data-ocid={`dashboard.button.${idx + 1}`}
                    className="flex-1 h-9 text-xs border-green-700/50 text-green-400 hover:bg-green-900/30 hover:border-green-600/60 disabled:opacity-40"
                  >
                    {updatingId === booking.id.toString() ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" /> Complete
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      booking.status !== BookingStatus.pending ||
                      updatingId === booking.id.toString()
                    }
                    onClick={() =>
                      handleUpdateStatus(booking.id, BookingStatus.cancelled)
                    }
                    data-ocid={`dashboard.cancel_button.${idx + 1}`}
                    className="flex-1 h-9 text-xs border-red-700/50 text-red-400 hover:bg-red-900/30 hover:border-red-600/60 disabled:opacity-40"
                  >
                    <XCircle className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
