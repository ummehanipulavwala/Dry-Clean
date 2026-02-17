import Service from "../models/servicemodel.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

//create service for admin
export const createService = async (req, res) => {
  try {
    if (req.user.role !== "Shop") {
      return sendError(res, 403, "Only shops can add services");
    }
    const { name, description, price, category, city } = req.body;

    if (!name || !price || !category || !city) {
      return sendError(res, 400, "Service name, price, category and city are required");
    }

    const existingService = await Service.findOne({ name });

    if (existingService) {
      return sendError(res, 409, "Service already exists");
    }

    const service = await Service.create({
      shop: req.user.id,
      name,
      price,
      description,
      category,
      city,
      image: req.file ? `/uploads/services/${req.file.filename}` : null,
    });

    sendSuccess(res, 201, "Service created successfully", service);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// get all services (public)
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).populate("shop", "firstName lastName city");

    sendSuccess(res, 200, "Services fetched successfully", { count: services.length, services });
  } catch (error) {
    sendError(res, 500, "Error fetching services", error.message);
  }
};

// Get Single Service by ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate("shop", "firstName lastName city");

    if (!service) {
      return sendError(res, 404, "Service not found");
    }

    sendSuccess(res, 200, "Service fetched successfully", service);
  } catch (error) {
    sendError(res, 500, "Error fetching service", error.message);
  }
};

// update service 
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!service) {
      return sendError(res, 404, "Service not found");
    }

    sendSuccess(res, 200, "Service updated successfully", service);
  } catch (error) {
    sendError(res, 500, "Error updating service", error.message);
  }
};

// delete service (deactivate)
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return sendError(res, 404, "Service not found");
    }

    sendSuccess(res, 200, "Service deleted successfully");
  } catch (error) {
    sendError(res, 500, "Error deleting service", error.message);
  }
};
