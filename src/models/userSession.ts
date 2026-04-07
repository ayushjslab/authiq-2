import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserSession extends Document {
    webUserId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    token: string; // The session token (hashed)
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    revoked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSessionSchema: Schema = new Schema(
    {
        webUserId: {
            type: Schema.Types.ObjectId,
            ref: "WebUser",
            required: true,
            index: true
        },
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true
        },
        token: { type: String, required: true, unique: true },
        expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL Index
        ipAddress: { type: String },
        userAgent: { type: String },
        revoked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index for finding sessions by project and user
UserSessionSchema.index({ projectId: 1, webUserId: 1 });

const UserSession: Model<IUserSession> =
    mongoose.models.UserSession || mongoose.model<IUserSession>("UserSession", UserSessionSchema);

export default UserSession;
