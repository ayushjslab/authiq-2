import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebUser extends Document {
    projectId: mongoose.Types.ObjectId; // Each user belongs to a specific Project
    email: string;
    passwordHash: string;
    isEmailVerified: boolean;
    metadata: Record<string, any>;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const WebUserSchema: Schema = new Schema(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        passwordHash: { type: String, required: true },
        isEmailVerified: { type: Boolean, default: false },
        metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
        lastLoginAt: { type: Date },
    },
    { timestamps: true }
);

// CRITICAL: Ensure uniqueness of email ONLY WITHIN the same Project
// A user should be able to sign up for Project A and Project B with the same email.
WebUserSchema.index({ projectId: 1, email: 1 }, { unique: true });

const WebUser: Model<IWebUser> =
    mongoose.models.WebUser || mongoose.model<IWebUser>("WebUser", WebUserSchema);

export default WebUser;
