import mongoose from "mongoose";

const cvAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    CVId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CV",
      default: null,
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    strength: {
      type: String,
      required: true,
      trim: true,
    },
    weakness: {
      type: String,
      required: true,
      trim: true,
    },
    suggestion: {
      type: String,
      required: true,
      trim: true,
    },
    fullAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
  },
);

// Indexes for faster queries
cvAnalysisSchema.index({ CVId: 1 });
cvAnalysisSchema.index({ atsScore: 1 });
cvAnalysisSchema.index({ createdAt: -1 });

const CVAnalysis = mongoose.model("CVAnalysis", cvAnalysisSchema);

export default CVAnalysis;
