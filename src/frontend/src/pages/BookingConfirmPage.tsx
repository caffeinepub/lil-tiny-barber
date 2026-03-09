import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Scissors,
  User,
} from "lucide-react";
import type { BookingResult, Page } from "../App";

interface BookingConfirmPageProps {
  result: BookingResult;
  onNavigate: (page: Page) => void;
}

export default function BookingConfirmPage({
  result,
  onNavigate,
}: BookingConfirmPageProps) {
  const formatSlotTime = (slot: string) => {
    const parts = slot.split(" ");
    if (parts.length === 2) {
      return { date: parts[0], time: parts[1] };
    }
    return { date: result.date, time: slot };
  };

  const { date, time } = formatSlotTime(result.timeSlot);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 page-transition">
      <div className="w-full max-w-md">
        {/* Success State */}
        <div
          data-ocid="booking_confirm.success_state"
          className="bg-card border border-border rounded-2xl overflow-hidden card-shadow"
        >
          {/* Gold Header */}
          <div className="gradient-gold px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-primary-foreground" />
              </div>
            </div>
            <h1
              className="text-2xl font-bold text-primary-foreground mb-1"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Booking Confirmed!
            </h1>
            <p className="text-primary-foreground/80 text-sm">
              Your slot has been reserved
            </p>
            <div className="mt-3 bg-white/20 rounded-full px-4 py-1.5 inline-block">
              <span className="text-primary-foreground text-xs font-mono font-semibold">
                #{result.bookingId}
              </span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="font-semibold text-foreground">
                  {result.customerName}
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salon</p>
                <p className="font-semibold text-foreground">
                  {result.salonName}
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Scissors className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Service</p>
                <p className="font-semibold text-foreground">
                  {result.service}
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-semibold text-foreground">{date}</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-semibold text-gold text-lg">{time}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-3">
            <Button
              className="w-full h-12 gradient-gold text-primary-foreground font-semibold border-0"
              onClick={() => onNavigate("booking")}
              data-ocid="booking_confirm.primary_button"
            >
              Book Another Appointment
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 border-border hover:border-gold/50"
              onClick={() => onNavigate("home")}
            >
              Back to Home
            </Button>
          </div>
        </div>

        {/* Tip */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Please arrive 5 minutes before your appointment.
        </p>
      </div>
    </div>
  );
}
