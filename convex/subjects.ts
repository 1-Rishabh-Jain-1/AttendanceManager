import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSubject = mutation({
    args: {
        userId: v.id("users"),
        subjectName: v.string(),
        professor: v.string(),
        lecturesAttended: v.number(),
        lecturesTotal: v.number(),
        type: v.union(v.literal("Theory"), v.literal("Practical")),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingSubject = await ctx.db
            .query("subjects")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("subjectName"), args.subjectName))
            .first();

        if (existingSubject) return;

        await ctx.db.insert("subjects", {
            userId: args.userId,
            subjectName: args.subjectName,
            professor: args.professor,
            lecturesAttended: args.lecturesAttended,
            lecturesTotal: args.lecturesTotal,
            type: args.type,
            description: args.description,
        });
    },
});

export const getSubjectsByUserId = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("subjects")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

export const getSubjectById = query({
    args: { subjectId: v.id("subjects") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.subjectId);
    },
});

export const updateSubject = mutation({
    args: {
        subjectId: v.id("subjects"),
        subjectName: v.string(),
        professor: v.string(),
        lecturesAttended: v.number(),
        lecturesTotal: v.number(),
        type: v.union(v.literal("Theory"), v.literal("Practical")),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.subjectId, {
            subjectName: args.subjectName,
            professor: args.professor,
            lecturesAttended: args.lecturesAttended,
            lecturesTotal: args.lecturesTotal,
            type: args.type,
            description: args.description,
        });
    },
});

export const deleteLecture = mutation({
    args: { lectureId: v.id("lectures") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.lectureId);
    },
});
