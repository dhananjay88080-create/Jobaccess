import { model, models, Schema, type Model } from "mongoose";

export interface SubscriberDocument {
  email: string;
  isActive: boolean;
  alertPreference: "all" | "government" | "private";
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<SubscriberDocument>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    alertPreference: { type: String, enum: ["all", "government", "private"], default: "all", index: true }
  },
  { timestamps: true }
);

export const SubscriberModel: Model<SubscriberDocument> =
  models.Subscriber || model<SubscriberDocument>("Subscriber", SubscriberSchema);
