import React from "react";
import { Button } from "@/components/ui/button";
import { TextRotate } from "@/components/ui/text-rotate";
import { motion } from "motion/react";
export default function HeroSection() {
  return <section className="relative w-full py-16 md:py-28 bg-gradient-to-br from-green-50 via-emerald-100 to-teal-50">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center px-4 gap-8">
        <h1 className="text-3xl sm:text-5xl font-bold mb-2 bg-gradient-to-b from-emerald-800 to-emerald-400 bg-clip-text text-transparent px-0 mx-0 my-0 py-[8px] md:text-5xl">Smart Fridge Management</h1>
        <div className="max-w-2xl mx-auto mb-4 text-lg md:text-2xl text-emerald-900/80 font-medium">
          <TextRotate texts={["Good food is wise medicine.", "Eat food, not too much, mostly plants.", "Don’t dig your grave with your own knife and fork.", "The secret of health is in the fridge.", "Preserve freshness, minimize waste.", "Fresh today, healthy tomorrow.", "You are what you eat!"]} mainClassName="bg-emerald-100 px-4 py-2 rounded-xl shadow-md min-h-[44px] font-bold text-emerald-700 text-lg md:text-2xl" staggerFrom="center" initial={{
          y: "100%",
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} exit={{
          y: "-120%",
          opacity: 0
        }} staggerDuration={0.03} transition={{
          type: "spring",
          damping: 32,
          stiffness: 350
        }} rotationInterval={2750} />
        </div>
        <p className="text-emerald-800/70 max-w-lg mx-auto">
          Effortlessly track expiry dates, cut food waste, and get AI-powered recipe recommendations based on your fridge contents.
        </p>
      </div>
    </section>;
}