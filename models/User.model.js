// User model
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        username: { type: String, trim: true, required: true, unique: true },
        email: {
            type: String,
            required: [true, 'Email is required.'],
            unique: true,
            lowercase: true,
            trim: true
        },
        passwordHash: { type: String, required: true },
        // avatar:       { type: String, enum: ['Easy Peasy', 'Amateur Chef', 'UltraPro Chef'] },
    },
    {
        timestamps: true
    }
);

module.exports = model('User', userSchema);