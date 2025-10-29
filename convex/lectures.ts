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

        const hoursAttended = lectures.reduce((sum, l) => sum + l.hoursAttended, 0);
        const hoursTotal = lectures.reduce((sum, l) => sum + l.hoursTotal, 0);

        return {
            subjectId: args.subjectId,
            hoursAttended,
            hoursTotal,
            attendancePercent: hoursTotal
                ? Math.round((hoursAttended / hoursTotal) * 100)
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
        professor: v.optional(v.string()),
        hoursTotal: v.number(),
        hoursAttended: v.number(),
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
                professor: args.professor,
                hoursTotal: args.hoursTotal,
                hoursAttended: args.hoursAttended,
                note: args.note,
            });
        } else {
            await ctx.db.insert("lectures", args);
        }

        const lectures = await ctx.db
            .query("lectures")
            .withIndex("by_subject_id", (q) => q.eq("subjectId", args.subjectId))
            .collect();

        const hoursAttended = lectures.reduce((sum, l) => sum + l.hoursAttended, 0);
        const hoursTotal = lectures.reduce((sum, l) => sum + l.hoursTotal, 0);

        await ctx.db.patch(args.subjectId, {
            hoursAttended,
            hoursTotal,
        });
    },
});

export const deleteLecture = mutation({
    args: { lectureId: v.id("lectures") },
    handler: async (ctx, args) => {
        const lecture = await ctx.db.get(args.lectureId);
        if (!lecture) return;

        await ctx.db.delete(args.lectureId);

        const lectures = await ctx.db
            .query("lectures")
            .withIndex("by_subject_id", (q) => q.eq("subjectId", lecture.subjectId))
            .collect();

        const hoursAttended = lectures.reduce((sum, l) => sum + l.hoursAttended, 0);
        const hoursTotal = lectures.reduce((sum, l) => sum + l.hoursTotal, 0);
        
        await ctx.db.patch(lecture.subjectId, {
            hoursAttended,
            hoursTotal,
        });
    },
});
