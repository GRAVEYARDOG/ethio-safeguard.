
import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, RegistrationStatus, TruckStatus } from '../types';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // Optional for now to support legacy data if needed, but required for new
    role: UserRole;
    status: RegistrationStatus;
    truckDetails?: {
        licensePlate: string;
        model: string;
        capacity: string;
        driverLicense: string;
        experienceYears: string;
        currentStatus: TruckStatus;
        location?: {
            lat: number;
            lng: number;
        };
    };
    organizationDetails?: {
        name: string;
        type: string;
        regNumber: string;
        sector: string;
        headquarters: string;
    };
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Should be hashed in production
    role: {
        type: String,
        enum: ['DRIVER', 'SENDER', 'ADMIN'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    truckDetails: {
        licensePlate: String,
        model: String,
        capacity: String,
        driverLicense: String,
        experienceYears: String,
        currentStatus: {
            type: String,
            enum: ['IDLE', 'READY', 'BUSY'],
            default: 'IDLE'
        },
        location: {
            lat: Number,
            lng: Number
        }
    },
    organizationDetails: {
        name: String,
        type: { type: String },
        regNumber: String,
        sector: String,
        headquarters: String
    }
});

UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});

export const User = mongoose.model<IUser>('User', UserSchema);
