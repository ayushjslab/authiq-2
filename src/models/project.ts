import mongoose, { Schema, Document, Model } from "mongoose";

export const ALL_PROVIDERS = ["google", "github", "facebook", "twitter", "discord", "microsoft", "slack"] as const;
export type SocialProvider = (typeof ALL_PROVIDERS)[number];

export const PLANS = ["free", "pro"] as const;
export type Plan = (typeof PLANS)[number];

export const PLAN_LIMITS: Record<Plan, { maxProviders: number; maxUsers: number }> = {
    free: { maxProviders: 3, maxUsers: 1000 },
    pro: { maxProviders: 7, maxUsers: Infinity },
};

export interface IProject extends Document {
    name: string;
    ownerId: string;
    publicKey: string;
    secretKey: string;
    plan: Plan;
    settings: {
        allowedOrigins: string[];
        redirectUrls: string[];
        enabledProviders: SocialProvider[];
        maxUsers: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        ownerId: { type: String, required: true, index: true },
        publicKey: { type: String, required: true, unique: true },
        secretKey: { type: String, required: true },
        plan: { type: String, enum: PLANS, default: "free" },
        settings: {
            allowedOrigins: { type: [String], default: [] },
            redirectUrls: { type: [String], default: [] },
            enabledProviders: {
                type: [String],
                enum: ALL_PROVIDERS,
                default: [],
            },
            maxUsers: { type: Number, default: 1000 },
        },
    },
    { timestamps: true }
);

// Indexes for performance and uniqueness
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ publicKey: 1 }, { unique: true });

const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
