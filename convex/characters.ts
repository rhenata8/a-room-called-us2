
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ROOM_ID = "living-room";
const ONLINE_WINDOW = 20_000;

export const selectCharacter = mutation({
  args: {
    visitorId: v.string(),
    character: v.union(
      v.literal("boy"),
      v.literal("girl")
    ),
  },

  handler: async (ctx, args) => {
    const now = Date.now();

    const visitor = await ctx.db
      .query("visitors")
      .withIndex("by_visitorId", (q) =>
        q.eq("visitorId", args.visitorId)
      )
      .unique();

    const targetSlot = await ctx.db
      .query("characterSlots")
      .withIndex("by_room_character", (q) =>
        q
          .eq("roomId", ROOM_ID)
          .eq("character", args.character)
      )
      .unique();

    // Cek apakah karakter sedang digunakan orang lain.
    if (
      targetSlot &&
      targetSlot.visitorId !== args.visitorId &&
      targetSlot.lastSeen > now - ONLINE_WINDOW
    ) {
      throw new Error(
        "Karakter ini sedang digunakan pengunjung lain."
      );
    }

    // Lepaskan slot karakter sebelumnya jika berganti.
    if (
      visitor?.character &&
      visitor.character !== args.character
    ) {
      const oldSlot = await ctx.db
        .query("characterSlots")
        .withIndex("by_room_character", (q) =>
          q
            .eq("roomId", ROOM_ID)
            .eq("character", visitor.character as "boy" | "girl")
        )
        .unique();

      if (oldSlot?.visitorId === args.visitorId) {
        await ctx.db.delete(oldSlot._id);
      }
    }

    // Ambil atau perbarui slot karakter.
    if (targetSlot) {
      await ctx.db.patch(targetSlot._id, {
        visitorId: args.visitorId,
        lastSeen: now,
      });
    } else {
      await ctx.db.insert("characterSlots", {
        roomId: ROOM_ID,
        character: args.character,
        visitorId: args.visitorId,
        lastSeen: now,
      });
    }

    // Simpan pilihan karakter pengunjung.
    if (visitor) {
      await ctx.db.patch(visitor._id, {
        character: args.character,
        lastSeen: now,
      });
    } else {
      await ctx.db.insert("visitors", {
        visitorId: args.visitorId,
        roomId: ROOM_ID,
        character: args.character,
        x: 0,
        z: 0,
        rotation: 0,
        lastSeen: now,
        lastMoveAt: 0,
      });
    }

    return {
      success: true,
      character: args.character,
    };
  },
});

export const releaseCharacter = mutation({
  args: {
    visitorId: v.string(),
  },

  handler: async (ctx, args) => {
    const visitor = await ctx.db
      .query("visitors")
      .withIndex("by_visitorId", (q) =>
        q.eq("visitorId", args.visitorId)
      )
      .unique();

    if (!visitor) return null;

    if (visitor.character) {
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
        await ctx.db.delete(slot._id);
      }
    }

    await ctx.db.patch(visitor._id, {
      character: null,
      lastSeen: Date.now(),
    });

    return { success: true };
  },
});

export const getCharacterAvailability = query({
  args: {},

  handler: async (ctx) => {
    const now = Date.now();

    const [boySlot, girlSlot] = await Promise.all([
      ctx.db
        .query("characterSlots")
        .withIndex("by_room_character", (q) =>
          q
            .eq("roomId", ROOM_ID)
            .eq("character", "boy")
        )
        .unique(),

      ctx.db
        .query("characterSlots")
        .withIndex("by_room_character", (q) =>
          q
            .eq("roomId", ROOM_ID)
            .eq("character", "girl")
        )
        .unique(),
    ]);

    return {
      boyAvailable:
        !boySlot || boySlot.lastSeen <= now - ONLINE_WINDOW,

      girlAvailable:
        !girlSlot || girlSlot.lastSeen <= now - ONLINE_WINDOW,
    };
  },
});

export const getMyCharacter = query({
  args: {
    visitorId: v.string(),
  },

  handler: async (ctx, args) => {
    const visitor = await ctx.db
      .query("visitors")
      .withIndex("by_visitorId", (q) =>
        q.eq("visitorId", args.visitorId)
      )
      .unique();

    return visitor?.character ?? null;
  },
});
