import DeliveryPerson from "../models/DeliveryPerson.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

// Create a new delivery person
export const createDeliveryPerson = async (req, res) => {
    try {
        const { name, phone, email, status } = req.body || {};

        if (!name || !phone) {
            return sendError(res, 400, "Name and phone number are required");
        }

        // Check if phone already exists
        const existingPerson = await DeliveryPerson.findOne({ phone });
        if (existingPerson) {
            return sendError(res, 400, "Delivery person with this phone number already exists");
        }

        let profileImage = "";
        if (req.files && req.files.length > 0) {
            profileImage = `/uploads/delivery/${req.files[0].filename}`;
        } else if (req.file) {
            profileImage = `/uploads/delivery/${req.file.filename}`;
        }

        const newPerson = new DeliveryPerson({
            name,
            phone,
            email,
            profileImage,
            status: status || "Active"
        });

        const savedPerson = await newPerson.save();
        sendSuccess(res, 201, "Delivery person created successfully", savedPerson);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};

// Get all delivery persons
export const getAllDeliveryPersons = async (req, res) => {
    try {
        const personsRaw = await DeliveryPerson.find().sort({ createdAt: -1 });
        
        // Explicitly map fields for compatibility with Admin UI expectations
        const persons = personsRaw.map(p => {
            const obj = p.toJSON();
            return {
                ...obj,
                // Ensure assigned and completed are present and are numbers
                assigned: Number(obj.assignedOrders || 0),
                completed: Number(obj.completedDeliveries || 0),
                // Providing common phone aliases just in case
                phone: obj.phone,
                phoneNumber: obj.phone,
                phone_no: obj.phone,
                contact: obj.phone
            };
        });

        sendSuccess(res, 200, "Delivery persons fetched successfully", persons);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};

// Get delivery person by ID
export const getDeliveryPersonById = async (req, res) => {
    try {
        const { id } = req.params;
        const person = await DeliveryPerson.findById(id);

        if (!person) {
            return sendError(res, 404, "Delivery person not found");
        }

        sendSuccess(res, 200, "Delivery person fetched successfully", person);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};

// Update delivery person
export const updateDeliveryPerson = async (req, res) => {
    try {
        const { id } = req.params;

        // Allowed fields for update
        const allowedFields = [
            'name', 'phone', 'email', 'status',
            'assignedOrders', 'completedDeliveries',
            'rating', 'profileImage'
        ];

        let updateData = {};

        // Check both body and query for data (to be flexible with Postman)
        const sources = [req.body, req.query];
        let validationError = null;

        sources.forEach(source => {
            if (source && !validationError) {
                allowedFields.forEach(field => {
                    if (source[field] !== undefined) {
                        // Validate phone if it's being updated
                        if (field === 'phone') {
                            const phoneVal = String(source[field]).trim();
                            if (!phoneVal) {
                                validationError = "Phone number cannot be empty";
                            } else if (!/^\d{10}$/.test(phoneVal)) {
                                validationError = "Phone number must be exactly 10 digits";
                            } else {
                                updateData[field] = phoneVal;
                            }
                        } else {
                            updateData[field] = source[field];
                        }
                    }
                });
            }
        });

        if (validationError) {
            return sendError(res, 400, validationError);
        }

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            updateData.profileImage = `/uploads/delivery/${req.files[0].filename}`;
        } else if (req.file) {
            updateData.profileImage = `/uploads/delivery/${req.file.filename}`;
        }

        const updatedPerson = await DeliveryPerson.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedPerson) {
            return sendError(res, 404, "Delivery person not found");
        }

        sendSuccess(res, 200, "Delivery person updated successfully", updatedPerson);
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};

// Delete delivery person
export const deleteDeliveryPerson = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPerson = await DeliveryPerson.findByIdAndDelete(id);

        if (!deletedPerson) {
            return sendError(res, 404, "Delivery person not found");
        }

        sendSuccess(res, 200, "Delivery person deleted successfully");
    } catch (error) {
        sendError(res, 500, "Server Error", error.message);
    }
};
