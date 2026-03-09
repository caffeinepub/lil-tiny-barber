import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminPage from "./pages/AdminPage";
import BookingConfirmPage from "./pages/BookingConfirmPage";
import BookingPage from "./pages/BookingPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import StaffLoginPage from "./pages/StaffLoginPage";

export type Page =
  | "home"
  | "booking"
  | "booking-confirm"
  | "staff-login"
  | "dashboard"
  | "admin";

export interface BookingResult {
  bookingId: string;
  customerName: string;
  service: string;
  salonName: string;
  timeSlot: string;
  date: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(
    null,
  );

  const navigate = (page: Page) => {
    window.scrollTo(0, 0);
    setCurrentPage(page);
  };

  const handleBookingComplete = (result: BookingResult) => {
    setBookingResult(result);
    navigate("booking-confirm");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />
      {currentPage === "home" && <HomePage onNavigate={navigate} />}
      {currentPage === "booking" && (
        <BookingPage
          onNavigate={navigate}
          onBookingComplete={handleBookingComplete}
        />
      )}
      {currentPage === "booking-confirm" && bookingResult && (
        <BookingConfirmPage result={bookingResult} onNavigate={navigate} />
      )}
      {currentPage === "staff-login" && (
        <StaffLoginPage onNavigate={navigate} />
      )}
      {currentPage === "dashboard" && <DashboardPage onNavigate={navigate} />}
      {currentPage === "admin" && <AdminPage onNavigate={navigate} />}
    </div>
  );
}
