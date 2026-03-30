import mongoose from "mongoose";

const deliveryPersonSchema = new mongoose.Schema({
    deliveryId: {
        type: String,
        unique: true,
        required: true,
        default: () => "DEL-" + Math.floor(1000 + Math.random() * 9000),
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    profileImage: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
    },
    assignedOrders: {
        type: Number,
        default: 0,
    },
    completedDeliveries: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    joinedDate: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform: (doc, ret) => {
            if (ret.joinedDate) {
                const d = new Date(ret.joinedDate);
                ret.joinedDate = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
            }
            if (ret.createdAt) {
                const d = new Date(ret.createdAt);
                ret.createdAt = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
            if (ret.updatedAt) {
                const d = new Date(ret.updatedAt);
                ret.updatedAt = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            }
<<<<<<< HEAD
            // Add aliases for UI compatibility
            ret.assigned = ret.assignedOrders ?? 0;
            ret.completed = ret.completedDeliveries ?? 0;
=======
>>>>>>> c14c409 (order calculate payment)
            return ret;
        },
    },
});

const DeliveryPerson = mongoose.model("DeliveryPerson", deliveryPersonSchema);

export default DeliveryPerson;
