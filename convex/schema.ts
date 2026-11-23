
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  visitors: defineTable({
    visitorId: v.string(),
    roomId: v.string(),

    character: v.union(
      v.literal("boy"),
      v.literal("girl"),
      v.null()
    ),

    x: v.number(),
    z: v.number(),
    rotation: v.number(),

    lastSeen: v.number(),
    lastMoveAt: v.number(),
  }).index("by_visitorId", ["visitorId"])
    .index("by_roomId", ["roomId"]),

  characterSlots: defineTable({
    roomId: v.string(),

    character: v.union(
      v.literal("boy"),
      v.literal("girl")
    ),

    visitorId: v.string(),
    lastSeen: v.number(),
  })
    .index("by_room_character", ["roomId", "character"])
    .index("by_visitorId", ["visitorId"]),
});

export default schema;
