import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
    name: string;
    ownerId: string;
    publicKey: string;
    secretKey: string;
    settings: {
        allowedOrigins: string[];
        redirectUrls: string[];
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
        settings: {
            allowedOrigins: { type: [String], default: [] },
            redirectUrls: { type: [String], default: [] },
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
