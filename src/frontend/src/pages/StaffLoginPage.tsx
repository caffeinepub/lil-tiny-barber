import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Home,
  Loader2,
  Phone,
  Scissors,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { useActor } from "../hooks/useActor";

interface StaffLoginPageProps {
  onNavigate: (page: Page) => void;
}

type LoginStep = "mobile" | "otp" | "register" | "pending";

interface StaffSession {
  id: string;
  staffName: string;
  salonName: string;
  address: string;
  mobile: string;
}

export default function StaffLoginPage({ onNavigate }: StaffLoginPageProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const [loginStep, setLoginStep] = useState<LoginStep>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isExistingSalon, setIsExistingSalon] = useState(false);
  const [existingSalonData, setExistingSalonData] =
    useState<StaffSession | null>(null);
  const [staffName, setStaffName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [salonAddress, setSalonAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingSalonName, setPendingSalonName] = useState("");

  const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

  const handleSendOtp = async () => {
    if (!actor || actorFetching) return;
    if (mobile.trim().length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    setLoading(true);
    try {
      const salonData = await actor.loginSalon(mobile.trim());
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);

      if (salonData) {
        // Existing approved salon
        setIsExistingSalon(true);
        setExistingSalonData({
          id: salonData.id.toString(),
          staffName: salonData.staffName,
          salonName: salonData.salonName,
          address: salonData.address,
          mobile: salonData.mobile,
        });
        toast.success(`OTP sent to ${mobile}`);
      } else {
        // New or pending/rejected mobile — proceed to OTP then registration
        setIsExistingSalon(false);
        toast.success(`OTP sent to ${mobile}`);
      }
      setLoginStep("otp");
    } catch {
      toast.error("Failed to check mobile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.trim() !== generatedOtp) {
      toast.error("Invalid OTP. Please try again.");
      return;
    }
    if (isExistingSalon && existingSalonData) {
      // Existing approved salon — store session and go to dashboard
      localStorage.setItem(
        "litinybarber_staff",
        JSON.stringify(existingSalonData),
      );
      toast.success(`Welcome back, ${existingSalonData.staffName}!`);
      onNavigate("dashboard");
    } else {
      // New registration — fill in salon details
      setLoginStep("register");
    }
  };

  const handleRegister = async () => {
    if (!actor) return;
    if (!staffName.trim() || !salonName.trim() || !salonAddress.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await actor.registerSalon(
        mobile.trim(),
        staffName.trim(),
        salonName.trim(),
        salonAddress.trim(),
      );
      // Salon submitted — now pending admin approval
      setPendingSalonName(salonName.trim());
      toast.success("Salon submitted for approval!");
      setLoginStep("pending");
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (loginStep === "otp") setLoginStep("mobile");
    else if (loginStep === "register") setLoginStep("otp");
    else onNavigate("home");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col page-transition">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          {loginStep !== "pending" && (
            <button
              type="button"
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-gold" />
            <span
              className="font-semibold text-sm"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Staff Portal
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              {loginStep === "pending" ? (
                <Clock className="w-8 h-8 text-gold" />
              ) : (
                <Scissors className="w-8 h-8 text-gold" />
              )}
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              <span className="text-gradient-gold">Lil.Tiny</span> Staff
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loginStep === "mobile" && "Login or register your salon"}
              {loginStep === "otp" && "Verify your identity"}
              {loginStep === "register" && "Set up your salon profile"}
              {loginStep === "pending" && "Registration submitted"}
            </p>
          </div>

          {/* Step: Mobile */}
          {loginStep === "mobile" && (
            <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold">Enter Mobile Number</h3>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send you a verification OTP
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="staff-mobile" className="text-sm mb-2 block">
                    Mobile Number
                  </Label>
                  <Input
                    id="staff-mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, ""))
                    }
                    className="h-14 bg-background border-border focus:border-gold/50 text-base"
                    data-ocid="staff_login.input"
                    maxLength={15}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  />
                </div>
                <Button
                  className="w-full h-14 gradient-gold text-primary-foreground font-bold text-base border-0"
                  disabled={
                    mobile.trim().length < 10 || loading || actorFetching
                  }
                  onClick={handleSendOtp}
                  data-ocid="staff_login.primary_button"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </div>
            </div>
          )}

          {/* Step: OTP */}
          {loginStep === "otp" && (
            <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold">Verify OTP</h3>
                  <p className="text-xs text-muted-foreground">
                    Enter the 4-digit code
                  </p>
                </div>
              </div>

              {/* Demo OTP Display */}
              <div className="mb-5 p-4 bg-gold/10 border border-gold/30 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gold uppercase tracking-wide">
                    Demo Mode
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your OTP is:{" "}
                  <span className="font-bold text-foreground text-lg tracking-widest">
                    {generatedOtp}
                  </span>
                </p>
              </div>

              {/* Hint for new registrations */}
              {!isExistingSalon && (
                <div className="mb-5 p-3 bg-muted/50 border border-border rounded-xl">
                  <p className="text-xs text-muted-foreground">
                    New registration? After OTP verification you&apos;ll fill in
                    your salon details. Your salon will be reviewed by an admin
                    before going live.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp-input" className="text-sm mb-2 block">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp-input"
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className="h-14 bg-background border-border focus:border-gold/50 text-base text-center tracking-[0.5em] font-bold text-lg"
                    data-ocid="staff_login.input"
                    maxLength={4}
                    onKeyDown={(e) =>
                      e.key === "Enter" && otp.length === 4 && handleVerifyOtp()
                    }
                  />
                </div>
                <Button
                  className="w-full h-14 gradient-gold text-primary-foreground font-bold text-base border-0"
                  disabled={otp.length !== 4}
                  onClick={handleVerifyOtp}
                  data-ocid="staff_login.submit_button"
                >
                  Verify & Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step: Register */}
          {loginStep === "register" && (
            <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold">Salon Profile</h3>
                  <p className="text-xs text-muted-foreground">
                    Complete your registration
                  </p>
                </div>
              </div>

              {/* Approval notice */}
              <div className="mb-5 p-3 bg-gold/5 border border-gold/20 rounded-xl">
                <p className="text-xs text-muted-foreground">
                  <span className="text-gold font-semibold">Note:</span> After
                  registration, your salon will be reviewed by an admin. You can
                  log in only after approval.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="staff-name" className="text-sm mb-2 block">
                    Staff Name
                  </Label>
                  <Input
                    id="staff-name"
                    placeholder="Your name"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="h-12 bg-background border-border focus:border-gold/50"
                    data-ocid="staff_login.input"
                  />
                </div>
                <div>
                  <Label htmlFor="salon-name" className="text-sm mb-2 block">
                    Salon Name
                  </Label>
                  <Input
                    id="salon-name"
                    placeholder="Your salon name"
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    className="h-12 bg-background border-border focus:border-gold/50"
                    data-ocid="staff_login.input"
                  />
                </div>
                <div>
                  <Label htmlFor="salon-address" className="text-sm mb-2 block">
                    Salon Address
                  </Label>
                  <Textarea
                    id="salon-address"
                    placeholder="Full salon address"
                    value={salonAddress}
                    onChange={(e) => setSalonAddress(e.target.value)}
                    className="bg-background border-border focus:border-gold/50 resize-none"
                    rows={3}
                    data-ocid="staff_login.textarea"
                  />
                </div>
                <Button
                  className="w-full h-14 gradient-gold text-primary-foreground font-bold text-base border-0"
                  disabled={
                    !staffName.trim() ||
                    !salonName.trim() ||
                    !salonAddress.trim() ||
                    loading
                  }
                  onClick={handleRegister}
                  data-ocid="staff_login.submit_button"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Submitting..." : "Submit for Approval"}
                </Button>
              </div>
            </div>
          )}

          {/* Step: Pending Approval */}
          {loginStep === "pending" && (
            <div
              className="bg-card border border-gold/30 rounded-2xl p-8 card-shadow text-center"
              data-ocid="staff_login.success_state"
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-gold" />
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Submitted for Approval
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                Your salon{" "}
                <span className="text-foreground font-semibold">
                  {pendingSalonName}
                </span>{" "}
                has been submitted for approval.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Our admin will review your registration. Once approved, you can
                log in using the same mobile number. You&apos;ll appear in the
                customer booking list only after approval.
              </p>
              <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl mb-6 text-left">
                <p className="text-xs text-muted-foreground">
                  <span className="text-gold font-semibold">
                    What&apos;s next?
                  </span>
                  <br />
                  1. Admin reviews your registration
                  <br />
                  2. You receive approval notification
                  <br />
                  3. Log in with your mobile number
                  <br />
                  4. Manage your bookings from the dashboard
                </p>
              </div>
              <Button
                className="w-full h-12 gradient-gold text-primary-foreground font-bold border-0"
                onClick={() => onNavigate("home")}
                data-ocid="staff_login.primary_button"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
