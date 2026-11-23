
import { mutation } from "./_generated/server";
import { v } from "convex/values";

const ROOM_ID = "living-room";
const MIN_MOVE_INTERVAL = 75;

export const updatePosition = mutation({
  args: {
    visitorId: v.string(),
    x: v.number(),
    z: v.number(),
    rotation: v.number(),
  },

  handler: async (ctx, args) => {
    const visitor = await ctx.db
      .query("visitors")
      .withIndex("by_visitorId", (q) =>
        q.eq("visitorId", args.visitorId)
      )
      .unique();

    if (!visitor) {
      throw new Error(
        "Sesi pengunjung tidak ditemukan."
      );
    }

    if (!visitor.character) {
      throw new Error(
        "Pilih karakter terlebih dahulu."
      );
    }

    if (
      !Number.isFinite(args.x) ||
      !Number.isFinite(args.z) ||
      !Number.isFinite(args.rotation) ||
      Math.abs(args.x) > 100 ||
      Math.abs(args.z) > 100
    ) {
      throw new Error("Posisi karakter tidak valid.");
    }

    const now = Date.now();

    // Batasi frekuensi update posisi.
    if (
      now - visitor.lastMoveAt < MIN_MOVE_INTERVAL
    ) {
      return { updated: false };
    }

    // Normalisasi arah hadap.
    const fullRotation = Math.PI * 2;

    const rotation =
      ((args.rotation % fullRotation) + fullRotation) %
      fullRotation;

    await ctx.db.patch(visitor._id, {
      x: args.x,
      z: args.z,
      rotation,
      lastSeen: now,
      lastMoveAt: now,
    });

    // Perbarui waktu aktif slot karakter.
    const slot = await ctx.db
      .query("characterSlots")
      .withIndex("by_room_character", (q) =>
        q
          .eq("roomId", ROOM_ID)
          .eq(
            "character",
            visitor.character as "boy" | "girl"
          )
      )
      .unique();

    if (slot?.visitorId === args.visitorId) {
      await ctx.db.patch(slot._id, {
        lastSeen: now,
      });
    }

    return {
      updated: true,
      x: args.x,
      z: args.z,
      rotation,
    };
  },
});
