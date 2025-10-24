import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
    args: {
        username: v.string(),
        fullname: v.string(),
        bio: v.optional(v.string()),
        email: v.string(),
        profilePicture: v.optional(v.string()),
        clerkId: v.string(),
    },
    handler: async(ctx, args) => {
        const existingUser = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId)).first();
        if (existingUser) return;

        await ctx.db.insert("users", {
            username: args.username,
            fullname: args.fullname,
            bio: args.bio,
            email: args.email,
            profilePicture: args.profilePicture,
            clerkId: args.clerkId
        })
    }
});

export const getUserByClerkId = query({
    args: {
        clerkId: v.string(),
    },
    handler: async(ctx, args) => {
        return await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId)).first();
    }
});