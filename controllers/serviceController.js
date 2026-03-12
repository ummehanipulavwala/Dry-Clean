import Service from "../models/servicemodel.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

//create service for admin
export const createService = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !category) {
      return sendError(res, 400, "Service name and category are required");
    }

    const existingService = await Service.findOne({ name });

    if (existingService) {
      return sendError(res, 409, "Service already exists");
    }

    const service = await Service.create({
      name,
      description,
      category,
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
    const services = await Service.find({ isActive: true });

    sendSuccess(res, 200, "Services fetched successfully", { count: services.length, services });
  } catch (error) {
    sendError(res, 500, "Error fetching services", error.message);
  }
};

// get all services for admin (includes inactive ones)
export const getAllAdminServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    const formattedServices = services.map((service) => ({
      serviceId: service._id,
      serviceName: service.name,
      description: service.description,
      serviceImage: service.image || null,
      category: service.category,
      status: service.isActive ? "Active" : "Inactive",
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }));

    sendSuccess(res, 200, "All admin services fetched successfully", { count: formattedServices.length, services: formattedServices });
  } catch (error) {
    sendError(res, 500, "Error fetching all admin services", error.message);
  }
};

// Get Single Service by ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);

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

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/services/${req.file.filename}`;
    }

    const service = await Service.findByIdAndUpdate(
      id,
      updateData,
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

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return sendError(res, 404, "Service not found");
    }

    sendSuccess(res, 200, "Service deleted successfully");
  } catch (error) {
    sendError(res, 500, "Error deleting service", error.message);
  }
};
