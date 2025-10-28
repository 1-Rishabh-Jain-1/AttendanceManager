import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getLecturesBySubjectId = query({
    args: { subjectId: v.id("subjects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("lectures")
            .withIndex("by_subject_id", (q) => q.eq("subjectId", args.subjectId))
            .collect();
    },
});

export const getLectureSummaryBySubjectId = query({
    args: { subjectId: v.id("subjects") },
    handler: async (ctx, args) => {
        const lectures = await ctx.db
            .query("lectures")
            .withIndex("by_subject_id", (q) => q.eq("subjectId", args.subjectId))
            .collect();

        const totalAttended = lectures.reduce((sum, l) => sum + l.lecturesAttended, 0);
        const totalLectures = lectures.reduce((sum, l) => sum + l.lecturesTotal, 0);

        return {
            subjectId: args.subjectId,
            totalAttended,
            totalLectures,
            attendancePercent: totalLectures
                ? Math.round((totalAttended / totalLectures) * 100)
                : 0,
        };
    },
});

export const getLectureByDate = query({
    args: {
        subjectId: v.id("subjects"),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("lectures")
            .withIndex("by_subject_id", (q) => q.eq("subjectId", args.subjectId))
            .filter((q) => q.eq(q.field("date"), args.date))
            .first();
    },
});

export const createOrUpdateLecture = mutation({
    args: {
        subjectId: v.id("subjects"),
        date: v.string(),
        lecturesTotal: v.number(),
        lecturesAttended: v.number(),
        note: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("lectures")
            .withIndex("by_subject_id", (q) => q.eq("subjectId", args.subjectId))
            .filter((q) => q.eq(q.field("date"), args.date))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                lecturesTotal: args.lecturesTotal,
                lecturesAttended: args.lecturesAttended,
                note: args.note,
            });
        } else {
            await ctx.db.insert("lectures", args);
        }
    },
});

export const deleteLecture = mutation({
    args: { lectureId: v.id("lectures") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.lectureId);
    },
});
