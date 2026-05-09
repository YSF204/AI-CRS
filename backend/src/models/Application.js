import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    cvId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CV",
      required: false, // Optional for manual applications
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
    },
    applicantInfo: {
      fullName: {
        type: String,
        required: false,
        default: "Candidate",
        trim: true,
      },
      email: {
        type: String,
        required: false,
        default: "",
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      linkedin: {
        type: String,
        trim: true,
        default: "",
      },
      portfolioUrl: {
        type: String,
        trim: true,
        default: "",
      },
      summary: {
        type: String,
        trim: true,
      },
      technicalSkills: {
        type: [String],
        default: [],
      },
      softSkills: {
        type: [String],
        default: [],
      },
      yearsOfExperience: {
        type: Number,
        default: 0,
      },
      languages: {
        type: [String],
        default: [],
      },
      additionalInformation: {
        type: String,
        trim: true,
        default: "",
      },
      certifications: {
        type: [String],
        default: [],
      },
      education: [
        {
          institutionName: {
            type: String,
            trim: true,
            default: "",
          },
          certification: {
            type: String,
            trim: true,
            default: "",
          },
          durationFrom: {
            type: String,
            trim: true,
            default: "",
          },
          durationTo: {
            type: String,
            trim: true,
            default: "",
          },
          summary: {
            type: String,
            trim: true,
            default: "",
          },
        },
      ],
    },
    cvFile: {
      filename: {
        type: String,
      },
      path: {
        type: String,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    matchPercentage: {
      type: Number,
      required: false,
      default: null,
      min: 0,
      max: 100,
    },
    matchDetails: {
      technicalSkillsMatch: {
        type: Number,
        default: 0,
      },
      experienceMatch: {
        type: Number,
        default: 0,
      },
      softSkillsMatch: {
        type: Number,
        default: 0,
      },
      languagesMatch: {
        type: Number,
        default: 0,
      },
      matchAnalysis: {
        type: String,
        default: "",
      },
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    aiAnalysisPending: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    isNotified: {
      type: Boolean,
      default: false,
    },
    applicationMethod: {
      type: String,
      enum: ["existingCv", "uploadPdf", "manual"],
      required: true,
      default: "manual",
    },
    isPotential: {
      type: Boolean,
      default: false,
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
applicationSchema.index({ userId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ employerId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
