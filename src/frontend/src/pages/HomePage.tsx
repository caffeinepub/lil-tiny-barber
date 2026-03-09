import { Button } from "@/components/ui/button";
import { Clock, MapPin, Scissors, Star } from "lucide-react";
import type { Page } from "../App";

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/barber-hero.dim_1200x800.jpg')",
          }}
        />
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        {/* Diagonal gold accent line */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, oklch(75% 0.15 65 / 0.08) 0%, transparent 50%)",
          }}
        />

        {/* Top nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-gold" />
            <span className="text-sm font-semibold tracking-widest uppercase text-gold-light">
              Lil.Tiny Barber
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("staff-login")}
            data-ocid="home.link"
            className="text-sm text-muted-foreground hover:text-gold transition-colors duration-200 tracking-wide border border-border hover:border-gold/50 px-4 py-2 rounded-md"
          >
            Staff Login
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
          {/* Decorative line */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-gold/60" />
            <Scissors className="w-5 h-5 text-gold" />
            <div className="h-px w-12 bg-gold/60" />
          </div>

          {/* Brand Name */}
          <h1
            className="font-display text-5xl sm:text-7xl md:text-8xl font-bold leading-tight mb-6"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            <span className="text-gradient-gold">Lil.Tiny</span>
            <br />
            <span className="text-foreground/95">Barber</span>
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed mb-12 font-light tracking-wide">
            Experience the finest haircuts and beard grooming in your
            neighborhood
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            data-ocid="home.primary_button"
            onClick={() => onNavigate("booking")}
            className="gradient-gold text-primary-foreground font-bold text-lg px-10 py-7 rounded-full gold-glow hover:scale-105 transition-all duration-300 tracking-wide uppercase border-0 shadow-2xl"
          >
            <Scissors className="w-5 h-5 mr-3" />
            Book a Slot
          </Button>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 mt-14 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gold fill-current" />
              <span>5-Star Service</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              <span>Quick Booking</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" />
              <span>Near You</span>
            </div>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="relative z-10 pb-8 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="bg-card px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="font-display text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Our <span className="text-gold">Services</span>
            </h2>
            <p className="text-muted-foreground">
              Premium grooming, tailored to you
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Hair Cut",
                duration: "10 min",
                desc: "Classic to modern cuts, styled to perfection.",
                icon: "✂️",
              },
              {
                title: "Beard Trim",
                duration: "10 min",
                desc: "Shape and define your beard with precision.",
                icon: "🪒",
              },
              {
                title: "Hair Cut + Beard",
                duration: "20 min",
                desc: "Complete grooming package for the modern man.",
                icon: "💈",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="bg-background border border-border rounded-xl p-6 hover:border-gold/40 transition-colors duration-300 card-shadow"
              >
                <div className="text-3xl mb-3">{service.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">
                  {service.title}
                </h3>
                <span className="text-xs text-gold font-medium tracking-wide uppercase bg-gold/10 px-2 py-1 rounded-full">
                  {service.duration}
                </span>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-gold" />
              <span
                className="text-sm font-semibold text-gold-light"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Lil.Tiny Barber
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
          {/* Subtle portal links */}
          <div className="flex items-center justify-center gap-4 pt-3 border-t border-border/50">
            <button
              type="button"
              onClick={() => onNavigate("staff-login")}
              data-ocid="home.link"
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Staff Portal
            </button>
            <span className="text-muted-foreground/30 text-xs">·</span>
            <button
              type="button"
              onClick={() => onNavigate("admin")}
              data-ocid="home.link"
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
