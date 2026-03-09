import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  KeyRound,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  RefreshCw,
  Scissors,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { useActor } from "../hooks/useActor";

interface AdminPageProps {
  onNavigate: (page: Page) => void;
}

interface PendingSalon {
  id: bigint;
  staffName: string;
  salonName: string;
  address: string;
  mobile: string;
  registeredAt: bigint;
  status: string;
}

const ADMIN_PIN = "Ramji@123";
const SESSION_KEY = "litinybarber_admin_auth";

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  });
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pendingSalons, setPendingSalons] = useState<PendingSalon[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handlePinSubmit = () => {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setIsAuthenticated(true);
      setPinError(false);
      toast.success("Admin access granted");
    } else {
      setPinError(true);
      setPin("");
      toast.error("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setPin("");
    toast.success("Logged out from admin panel");
  };

  const fetchPendingSalons = useCallback(async () => {
    if (!actor || actorFetching || !isAuthenticated) return;
    setLoading(true);
    try {
      const data = await actor.getPendingSalons();
      setPendingSalons(data as PendingSalon[]);
    } catch {
      toast.error("Failed to load pending registrations");
    } finally {
      setLoading(false);
    }
  }, [actor, actorFetching, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && actor && !actorFetching) {
      fetchPendingSalons();
    }
  }, [isAuthenticated, actor, actorFetching, fetchPendingSalons]);

  const handleApprove = async (salonId: bigint) => {
    if (!actor) return;
    const idStr = salonId.toString();
    setProcessingId(idStr);
    try {
      const success = await actor.approveSalon(salonId);
      if (success) {
        setPendingSalons((prev) => prev.filter((s) => s.id !== salonId));
        toast.success("Salon approved! It's now visible to customers.");
      } else {
        toast.error("Failed to approve salon. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (salonId: bigint) => {
    if (!actor) return;
    const idStr = salonId.toString();
    setProcessingId(idStr);
    try {
      const success = await actor.rejectSalon(salonId);
      if (success) {
        setPendingSalons((prev) => prev.filter((s) => s.id !== salonId));
        toast.success("Salon rejected.");
      } else {
        toast.error("Failed to reject salon. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ── Password Entry Screen ────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col page-transition">
        <header className="border-b border-border">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Scissors className="w-5 h-5 text-gold" />
            </button>
            <span
              className="font-semibold text-sm"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Admin Panel
            </span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-gold" />
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Admin <span className="text-gradient-gold">Access</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your admin password to continue
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure Login</h3>
                  <p className="text-xs text-muted-foreground">
                    Password required
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-pin" className="text-sm mb-2 block">
                    Admin Password
                  </Label>
                  <Input
                    id="admin-pin"
                    type="password"
                    placeholder="Enter Password"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setPinError(false);
                    }}
                    className={`h-14 bg-background text-base font-bold text-lg ${
                      pinError
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-gold/50"
                    }`}
                    onKeyDown={(e) =>
                      e.key === "Enter" && pin.length > 0 && handlePinSubmit()
                    }
                    data-ocid="admin.input"
                  />
                  {pinError && (
                    <p
                      className="text-xs text-destructive mt-1.5"
                      data-ocid="admin.error_state"
                    >
                      Incorrect password. Please try again.
                    </p>
                  )}
                </div>
                <Button
                  className="w-full h-14 gradient-gold text-primary-foreground font-bold text-base border-0"
                  disabled={pin.length === 0}
                  onClick={handlePinSubmit}
                  data-ocid="admin.submit_button"
                >
                  Access Admin Panel
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Admin Dashboard ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate("home")}
                className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center hover:bg-gold/20 transition-colors"
              >
                <Scissors className="w-4 h-4 text-gold" />
              </button>
              <div>
                <h1
                  className="font-bold text-sm leading-tight"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  <span className="text-gradient-gold">Lil.Tiny</span> Admin
                  Panel
                </h1>
                <p className="text-xs text-muted-foreground">
                  Manage salon registrations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPendingSalons}
                disabled={loading}
                data-ocid="admin.secondary_button"
                className="border-border hover:border-gold/50 gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <button
                type="button"
                onClick={handleLogout}
                data-ocid="admin.button"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-lg hover:bg-muted"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Section title */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Pending Registrations
            </h2>
            {pendingSalons.length > 0 && (
              <Badge className="bg-gold/20 text-gold border border-gold/30 hover:bg-gold/20">
                {pendingSalons.length}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Review and approve or reject salon registrations below.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="admin.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : pendingSalons.length === 0 ? (
          <div
            className="text-center py-20 border border-dashed border-border rounded-2xl"
            data-ocid="admin.empty_state"
          >
            <div className="text-5xl mb-4">🎉</div>
            <p className="font-semibold text-foreground">
              No pending registrations
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              All salon registrations have been processed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSalons.map((salon, idx) => (
              <div
                key={salon.id.toString()}
                data-ocid={`admin.row.${idx + 1}`}
                className="bg-card border border-border rounded-xl p-5 hover:border-gold/20 transition-colors"
              >
                {/* Salon header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Scissors className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">
                        {salon.salonName}
                      </h3>
                      <Badge className="mt-1 bg-yellow-900/30 text-yellow-300 border border-yellow-700/40 text-xs hover:bg-yellow-900/30">
                        Pending
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right flex-shrink-0">
                    Registered
                    <br />
                    <span className="text-foreground font-medium">
                      {formatDate(salon.registeredAt)}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-3.5 h-3.5 text-gold/70 flex-shrink-0" />
                    <span>{salon.staffName}</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-gold/70 flex-shrink-0 mt-0.5" />
                    <span>{salon.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-gold/70 flex-shrink-0" />
                    <span>{salon.mobile}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    disabled={processingId === salon.id.toString()}
                    onClick={() => handleApprove(salon.id)}
                    data-ocid={`admin.button.${idx + 1}`}
                    className="flex-1 h-10 text-sm bg-green-700/80 hover:bg-green-700 text-white border-0 gap-1.5"
                  >
                    {processingId === salon.id.toString() ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={processingId === salon.id.toString()}
                    onClick={() => handleReject(salon.id)}
                    data-ocid={`admin.delete_button.${idx + 1}`}
                    className="flex-1 h-10 text-sm border-red-700/50 text-red-400 hover:bg-red-900/30 hover:border-red-600/60 gap-1.5"
                  >
                    {processingId === salon.id.toString() ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
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
