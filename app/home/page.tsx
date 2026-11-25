
import type { Metadata } from "next";
import LivingRoomExperience from "@/components/home/LivingRoomExperience";

export const metadata: Metadata = {
  title: "A Room Called Us | Our Living Room",
  description:
    "A cheerful virtual living room where two little characters can meet, wander, and make memories.",
};

export default function HomePage() {
  return <LivingRoomExperience />;
}
