import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Scissors,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { BookingResult, Page } from "../App";
import { useActor } from "../hooks/useActor";

interface BookingPageProps {
  onNavigate: (page: Page) => void;
  onBookingComplete: (result: BookingResult) => void;
}

interface SalonListItem {
  id: bigint;
  address: string;
  salonName: string;
}

const SERVICES = [
  {
    id: "haircut",
    label: "Hair Cut",
    duration: "10 min",
    value: "Hair Cut",
    slots: 1,
    icon: "✂️",
  },
  {
    id: "beard",
    label: "Beard Trim",
    duration: "10 min",
    value: "Beard Trim",
    slots: 1,
    icon: "🪒",
  },
  {
    id: "both",
    label: "Hair Cut + Beard",
    duration: "20 min",
    value: "Hair Cut + Beard",
    slots: 2,
    icon: "💈",
  },
];

export default function BookingPage({
  onNavigate,
  onBookingComplete,
}: BookingPageProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const [step, setStep] = useState(1);
  const [salons, setSalons] = useState<SalonListItem[]>([]);
  const [salonsLoading, setSalonsLoading] = useState(true);
  const [selectedSalonId, setSelectedSalonId] = useState<string>("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  function getTodayString() {
    return new Date().toISOString().split("T")[0];
  }

  // Load only APPROVED salons
  useEffect(() => {
    if (!actor || actorFetching) return;
    setSalonsLoading(true);
    actor
      .getApprovedSalons()
      .then(setSalons)
      .catch(() => toast.error("Failed to load salons"))
      .finally(() => setSalonsLoading(false));
  }, [actor, actorFetching]);

  useEffect(() => {
    if (!actor || !selectedSalonId || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot("");
    actor
      .getAvailableSlots(BigInt(selectedSalonId), selectedDate)
      .then((fetchedSlots) => setSlots(fetchedSlots))
      .catch(() => toast.error("Failed to load slots"))
      .finally(() => setSlotsLoading(false));
  }, [actor, selectedSalonId, selectedDate]);

  const refreshSlots = async () => {
    if (!actor || !selectedSalonId || !selectedDate) return;
    setSlotsLoading(true);
    try {
      const updatedSlots = await actor.getAvailableSlots(
        BigInt(selectedSalonId),
        selectedDate,
      );
      setSlots(updatedSlots);
    } catch {
      // silent refresh failure is fine
    } finally {
      setSlotsLoading(false);
    }
  };

  const selectedSalon = salons.find((s) => s.id.toString() === selectedSalonId);
  const selectedServiceObj = SERVICES.find((s) => s.value === selectedService);

  const formatSlotTime = (slot: string) => {
    const parts = slot.split(" ");
    if (!parts[1]) return slot;
    // Convert 24h to 12h AM/PM
    const [hourStr, minStr] = parts[1].split(":");
    const hour = Number.parseInt(hourStr, 10);
    const min = minStr || "00";
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${min} ${period}`;
  };

  const canProceedStep1 = !!selectedSalonId;
  const canProceedStep2 = name.trim().length > 0 && mobile.trim().length >= 10;
  const canProceedStep3 = !!selectedService;
  const canProceedStep4 = !!selectedSlot;

  const handleSubmit = async () => {
    if (!actor || !selectedSalon || !selectedServiceObj || !selectedSlot)
      return;
    setSubmitting(true);
    try {
      const result = await actor.createBooking(
        BigInt(selectedSalonId),
        name.trim(),
        mobile.trim(),
        selectedService,
        selectedSlot,
        selectedDate,
      );
      if (result.success) {
        // Refresh slots so the booked slot disappears
        await refreshSlots();
        onBookingComplete({
          bookingId: result.bookingId.toString(),
          customerName: name.trim(),
          service: selectedService,
          salonName: selectedSalon.salonName,
          timeSlot: selectedSlot,
          date: selectedDate,
        });
      } else {
        toast.error(result.message || "Booking failed. Please try again.");
        // Refresh slots in case of conflict
        await refreshSlots();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Salon" },
    { num: 2, label: "Details" },
    { num: 3, label: "Service" },
    { num: 4, label: "Slot" },
  ];

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : onNavigate("home"))}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-gold" />
            <span
              className="font-semibold text-sm"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Book a Slot
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="flex items-center gap-1">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${
                    step > s.num
                      ? "bg-gold text-primary-foreground"
                      : step === s.num
                        ? "bg-gold/20 text-gold border border-gold"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className={`ml-1.5 text-xs hidden sm:block ${
                    step === s.num
                      ? "text-gold"
                      : step > s.num
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                  }`}
                >
                  {s.label}
                </span>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 transition-all duration-300 ${
                      step > s.num ? "bg-gold/60" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Select Salon */}
        {step === 1 && (
          <div className="page-transition">
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Choose Your Salon
              </h2>
              <p className="text-muted-foreground text-sm">
                Select from our approved barber salons
              </p>
            </div>
            {salonsLoading || actorFetching ? (
              <div
                className="flex items-center justify-center py-16"
                data-ocid="booking.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : salons.length === 0 ? (
              <div
                className="text-center py-16 border border-dashed border-border rounded-xl"
                data-ocid="booking.empty_state"
              >
                <div className="text-4xl mb-4">💈</div>
                <p className="text-muted-foreground">
                  No approved salons available.
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Salons appear here after admin approval.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">
                  Select Salon
                </Label>
                <Select
                  value={selectedSalonId}
                  onValueChange={setSelectedSalonId}
                >
                  <SelectTrigger
                    className="h-14 bg-card border-border hover:border-gold/50 transition-colors"
                    data-ocid="booking.select"
                  >
                    <SelectValue placeholder="Choose an approved salon..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {salons.map((salon) => (
                      <SelectItem
                        key={salon.id.toString()}
                        value={salon.id.toString()}
                        className="cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold">{salon.salonName}</div>
                          <div className="text-xs text-muted-foreground">
                            {salon.address}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedSalon && (
                  <div className="mt-4 p-4 bg-card border border-gold/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <Scissors className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {selectedSalon.salonName}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {selectedSalon.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-8">
              <Button
                className="w-full h-14 gradient-gold text-primary-foreground font-bold text-base border-0"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                data-ocid="booking.primary_button"
              >
                Continue <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <div className="page-transition">
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Your Details
              </h2>
              <p className="text-muted-foreground text-sm">
                We&apos;ll use this to confirm your booking
              </p>
            </div>
            <div className="space-y-5">
              <div>
                <Label htmlFor="customer-name" className="text-sm mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="customer-name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 bg-card border-border focus:border-gold/50 text-base"
                  data-ocid="booking.input"
                />
              </div>
              <div>
                <Label htmlFor="customer-mobile" className="text-sm mb-2 block">
                  Mobile Number
                </Label>
                <Input
                  id="customer-mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="h-14 bg-card border-border focus:border-gold/50 text-base"
                  data-ocid="booking.input"
                  maxLength={15}
                />
              </div>
            </div>
            <div className="mt-8">
              <Button
                className="w-full h-14 gradient-gold text-primary-foreground font-bold text-base border-0"
                disabled={!canProceedStep2}
                onClick={() => setStep(3)}
                data-ocid="booking.primary_button"
              >
                Continue <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Service */}
        {step === 3 && (
          <div className="page-transition">
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Choose Service
              </h2>
              <p className="text-muted-foreground text-sm">
                Select what you&apos;d like done today
              </p>
            </div>
            <div className="space-y-3">
              {SERVICES.map((service, idx) => (
                <button
                  type="button"
                  key={service.id}
                  data-ocid={`booking.radio.${idx + 1}`}
                  onClick={() => setSelectedService(service.value)}
                  className={`w-full p-5 rounded-xl border text-left transition-all duration-200 ${
                    selectedService === service.value
                      ? "border-gold bg-gold/10 gold-glow"
                      : "border-border bg-card hover:border-gold/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{service.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {service.label}
                        </span>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            selectedService === service.value
                              ? "bg-gold text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {service.duration}
                        </span>
                      </div>
                      {service.slots === 2 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Blocks 2 consecutive time slots automatically
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedService === service.value
                          ? "border-gold bg-gold"
                          : "border-border"
                      }`}
                    >
                      {selectedService === service.value && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8">
              <Button
                className="w-full h-14 gradient-gold text-primary-foreground font-bold text-base border-0"
                disabled={!canProceedStep3}
                onClick={() => setStep(4)}
                data-ocid="booking.primary_button"
              >
                Continue <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Select Date & Time Slot */}
        {step === 4 && (
          <div className="page-transition">
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Pick Your Slot
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-muted-foreground text-sm">
                  Select an available time
                </p>
                <span className="text-xs bg-gold/10 border border-gold/30 text-gold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  8:00 AM – 7:00 PM
                </span>
              </div>
            </div>

            {/* Date picker */}
            <div className="mb-6">
              <Label htmlFor="booking-date" className="text-sm mb-2 block">
                Date
              </Label>
              <Input
                id="booking-date"
                type="date"
                value={selectedDate}
                min={getTodayString()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-14 bg-card border-border focus:border-gold/50 text-base"
                data-ocid="booking.input"
              />
            </div>

            {/* Time Slots */}
            <div>
              <Label className="text-sm mb-3 block">
                Available Slots
                {slotsLoading && (
                  <Loader2 className="w-3.5 h-3.5 inline ml-2 animate-spin text-gold" />
                )}
              </Label>

              {slotsLoading ? (
                <div
                  className="flex items-center justify-center py-12"
                  data-ocid="booking.loading_state"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-gold" />
                </div>
              ) : slots.length === 0 ? (
                <div
                  className="text-center py-10 border border-dashed border-border rounded-xl"
                  data-ocid="booking.empty_state"
                >
                  <p className="text-muted-foreground">
                    No available slots for this date.
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Try a different date or all slots may be booked.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 px-2 rounded-lg text-sm font-medium transition-all duration-200 slot-available ${
                        selectedSlot === slot
                          ? "bg-gold text-primary-foreground gold-glow scale-105"
                          : "bg-card border border-border hover:border-gold/50 text-foreground"
                      }`}
                    >
                      {formatSlotTime(slot)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Summary */}
            {selectedSlot && (
              <div className="mt-6 p-4 bg-card border border-gold/30 rounded-xl">
                <h4 className="text-sm font-semibold text-gold mb-2 uppercase tracking-wide">
                  Booking Summary
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salon</span>
                    <span className="font-medium">
                      {selectedSalon?.salonName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{selectedService}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-gold">
                      {formatSlotTime(selectedSlot)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <Button
                className="w-full h-14 gradient-gold text-primary-foreground font-bold text-base border-0"
                disabled={!canProceedStep4 || submitting}
                onClick={handleSubmit}
                data-ocid="booking.submit_button"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Booking...
                  </>
                ) : (
                  <>
                    Confirm Booking <Check className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
