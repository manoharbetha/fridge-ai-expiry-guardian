
import { HeroWithMockup } from "@/components/ui/hero-with-mockup"

export default function Landing() {
  return (
    <HeroWithMockup
      title="Smart Fridge Manager"
      description="Easily track what’s in your fridge, get expiry alerts, and reduce food waste with our smart, AI-powered dashboard."
      primaryCta={{
        text: "Get Started",
        href: "/auth",
      }}
      secondaryCta={{
        text: "View on GitHub",
        href: "https://github.com/",
      }}
      mockupImage={{
        alt: "Smart Fridge manager demo dashboard",
        width: 1248,
        height: 765,
        src: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      }}
    />
  );
}
