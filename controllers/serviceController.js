import Service from "../models/servicemodel.js";
<<<<<<< HEAD
import { sendSuccess, sendError } from "../utils/responseHandler.js";
=======
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e

//create service for admin
export const createService = async (req, res) => {
  try {
    if (req.user.role !== "Shop") {
<<<<<<< HEAD
      return sendError(res, 403, "Only shops can add services");
=======
      return res.status(403).json({ message: "Only shops can add services" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }
    const { name, description, price, category, city } = req.body;

    if (!name || !price || !category || !city) {
<<<<<<< HEAD
      return sendError(res, 400, "Service name, price, category and city are required");
=======
      return res.status(400).json({
        message: "Service name, price, category and city are required",
      });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
    }

    const existingService = await Service.findOne({ name });

    if (existingService) {
<<<<<<< HEAD
      return sendError(res, 409, "Service already exists");
=======
      return res.status(409).json({
        message: "Service already exists",
      });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
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

<<<<<<< HEAD
    sendSuccess(res, 201, "Service created successfully", service);
  } catch (error) {
    sendError(res, 500, error.message);
=======
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};

// get all services (public)
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).populate("shop", "firstName lastName city");

<<<<<<< HEAD
    sendSuccess(res, 200, "Services fetched successfully", { count: services.length, services });
  } catch (error) {
    sendError(res, 500, "Error fetching services", error.message);
=======
    res.status(200).json({
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching services",
      error: error.message,
    });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};

// Get Single Service by ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate("shop", "firstName lastName city");

    if (!service) {
<<<<<<< HEAD
      return sendError(res, 404, "Service not found");
    }

    sendSuccess(res, 200, "Service fetched successfully", service);
  } catch (error) {
    sendError(res, 500, "Error fetching service", error.message);
=======
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Error fetching service", error: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
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
<<<<<<< HEAD
      return sendError(res, 404, "Service not found");
    }

    sendSuccess(res, 200, "Service updated successfully", service);
  } catch (error) {
    sendError(res, 500, "Error updating service", error.message);
=======
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json({
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating service",
      error: error.message,
    });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
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
<<<<<<< HEAD
      return sendError(res, 404, "Service not found");
    }

    sendSuccess(res, 200, "Service deleted successfully");
  } catch (error) {
    sendError(res, 500, "Error deleting service", error.message);
=======
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting service",
      error: error.message,
    });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};
