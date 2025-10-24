import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        username: v.string(),
        fullname: v.string(),
        bio: v.optional(v.string()),
        email: v.string(),
        profilePicture: v.optional(v.string()),
        clerkId: v.string(),
    }).index("by_clerk_id", ["clerkId"]).index("by_username", ["username"]).index("by_email", ["email"]),

    subjects: defineTable({
        userId: v.id("users"),
        subjectName: v.string(),
        professor: v.string(),
        type: v.union(v.literal("Theory"), v.literal("Practical")),
        description: v.optional(v.string()),
    }).index("by_user_id", ["userId"]),

    lectures: defineTable({
        subjectId: v.id("subjects"),
        date: v.string(),
        lecturesAttended: v.number(),
        lecturesTotal: v.number(),
        note: v.optional(v.string()),
    }).index("by_subject_id", ["subjectId"]),
});