import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, default: "" },
  date: { type: Date, default: Date.now },
});

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["dog", "cat", "bird"], // Only these values are allowed
      required: true,
    },  
    description: { type: String, required: true },
    color: { type: String, required: true },
    rentPrice: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
    deposit: { type: Number, required: true },
    available: { type: Boolean, default: true },
    imageUrl: { type: String, required: true },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
 
);

const Pet = mongoose.model("Pet", petSchema);
export default Pet;
