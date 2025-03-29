const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    favorites: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one favorite must be selected",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
