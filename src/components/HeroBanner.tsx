import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    title: "Welcome Bonus",
    subtitle: "Get ₦500 FREE on signup!",
    image: "https://images.pexels.com/photos/10741372/pexels-photo-10741372.jpeg",
    alt: "Interior of a betting cafe with people watching sports",
  },
  {
    title: "Live Betting",
    subtitle: "Bet on matches happening right now",
    image: "https://images.pexels.com/photos/31519329/pexels-photo-31519329.jpeg",
    alt: "Action shot of a soccer player in motion on a football field",
  },
  {
    title: "Aviator Crash Game",
    subtitle: "Fly high, cash out before it crashes!",
    image: "https://images.pexels.com/photos/4677404/pexels-photo-4677404.jpeg",
    alt: "Casino chips and dice on a felt table with online gaming",
  },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-xl"
          style={{
            backgroundImage: `url(${slides[current].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 rounded-xl" />

          {/* Content */}
          <div className="relative z-10 p-6 md:p-10">
            <h2 className="font-display text-2xl font-bold text-white md:text-4xl">{slides[current].title}</h2>
            <p className="mt-2 text-sm text-white/90 md:text-base">{slides[current].subtitle}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn("h-1.5 rounded-full transition-all", i === current ? "w-6 bg-foreground" : "w-1.5 bg-foreground/40")}
          />
        ))}
      </div>

      <button onClick={() => setCurrent((p) => (p - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/30 p-1 text-foreground">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => setCurrent((p) => (p + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/30 p-1 text-foreground">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default HeroBanner;
