const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: ['farmer', 'business', 'customer', 'admin'], required: true },

    // Verification
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },

    // Account lockout
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    isSuspended: { type: Boolean, default: false },

    // Profile
    profilePicture: { type: String },
    bio: { type: String },

    // Farmer fields
    farmName: { type: String },
    farmAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
        country: { type: String },
    },
    farmGeolocation: {
        lat: { type: Number },
        lng: { type: Number },
    },
    cropsGrown: [{ type: String }],
    businessName: { type: String }, // For farmers who operate as a business

    // Bank Details
    bankDetails: {
        accountName: { type: String },
        accountNumber: { type: String },
        bankName: { type: String },
        branch: { type: String },
        ifscCode: { type: String },
    },

    // Business fields (for role='business')
    companyName: { type: String },
    businessType: { type: String },
    companyAddress: { type: String },
    gstin: { type: String },
    cin: { type: String },
    contactPersonName: { type: String },
    contactPersonDesignation: { type: String },
    produceRequired: [{ type: String }],

    // Customer fields
    deliveryAddress: { type: String },
    billingAddress: { type: String },

    // Documents
    documents: [
        {
            name: { type: String, required: true }, // e.g., 'Organic Certificate', 'FSSAI', 'ID Proof'
            url: { type: String, required: true },
            verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        },
    ],

    photos: [{ type: String }], // General photos, maybe of the farm

    // Farmer Rating
    rating: { type: Number, min: 0, max: 5, default: 3.5 }, // Average rating out of 5
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);