
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ROOM_ID = "living-room";

const ONLINE_WINDOW = 20_000;
const CLEANUP_WINDOW = 24 * 60 * 60 * 1000;

export const joinRoom = mutation({
  args: {
    visitorId: v.string(),
  },

  handler: async (ctx, args) => {
    const now = Date.now();

    // Bersihkan pengunjung yang sudah lama tidak aktif.
    const visitors = await ctx.db
      .query("visitors")
      .withIndex("by_roomId", (q) =>
        q.eq("roomId", ROOM_ID)
      )
      .collect();

    for (const visitor of visitors) {
      if (visitor.lastSeen < now - CLEANUP_WINDOW) {
        await ctx.db.delete(visitor._id);
      }
    }

    const slots = await ctx.db
      .query("characterSlots")
      .collect();

    for (const slot of slots) {
      if (slot.lastSeen < now - CLEANUP_WINDOW) {
        await ctx.db.delete(slot._id);
      }
    }

    const existing = await ctx.db
      .query("visitors")
      .withIndex("by_visitorId", (q) =>
        q.eq("visitorId", args.visitorId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: now,
      });

      return {
        visitorId: args.visitorId,
        character: existing.character,
      };
    }

    await ctx.db.insert("visitors", {
      visitorId: args.visitorId,
      roomId: ROOM_ID,
      character: null,
      x: 0,
      z: 0,
      rotation: 0,
      lastSeen: now,
      lastMoveAt: 0,
    });

    return {
      visitorId: args.visitorId,
      character: null,
    };
  },
});

export const heartbeat = mutation({
  args: {
    visitorId: v.string(),
  },

  handler: async (ctx, args) => {
    const now = Date.now();

    const visitor = await ctx.db
      .query("visitors")
      .withIndex("by_visitorId", (q) =>
        q.eq("visitorId", args.visitorId)
      )
      .unique();

    if (!visitor) {
      await ctx.db.insert("visitors", {
        visitorId: args.visitorId,
        roomId: ROOM_ID,
        character: null,
        x: 0,
        z: 0,
        rotation: 0,
        lastSeen: now,
        lastMoveAt: 0,
      });

      return null;
    }

    await ctx.db.patch(visitor._id, {
      lastSeen: now,
    });

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
        await ctx.db.patch(slot._id, {
          lastSeen: now,
        });
      }
    }

    return null;
  },
});

export const leaveRoom = mutation({
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

    await ctx.db.delete(visitor._id);

    return { success: true };
  },
});

export const getRoomVisitors = query({
  args: {},

  handler: async (ctx) => {
    const now = Date.now();

    const visitors = await ctx.db
      .query("visitors")
      .withIndex("by_roomId", (q) =>
        q.eq("roomId", ROOM_ID)
      )
      .collect();

    return visitors
      .filter(
        (visitor) =>
          visitor.lastSeen > now - ONLINE_WINDOW
      )
      .map((visitor) => ({
        visitorId: visitor.visitorId,
        character: visitor.character,
        x: visitor.x,
        z: visitor.z,
        rotation: visitor.rotation,
        lastSeen: visitor.lastSeen,
      }));
  },
});
