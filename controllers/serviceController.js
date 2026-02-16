import Service from "../models/servicemodel.js";

//create service for admin
export const createService = async (req, res) => {
  try {
    if (req.user.role !== "Shop") {
      return res.status(403).json({ success: false, message: "Only shops can add services" });
    }
    const { name, description, price, category, city } = req.body;

    if (!name || !price || !category || !city) {
      return res.status(400).json({
        success: false,
        message: "Service name, price, category and city are required",
      });
    }

    const existingService = await Service.findOne({ name });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message: "Service already exists",
      });
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

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all services (public)
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).populate("shop", "firstName lastName city");

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching services",
      error: error.message,
    });
  }
};

// Get Single Service by ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate("shop", "firstName lastName city");

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching service", error: error.message });
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
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating service",
      error: error.message,
    });
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
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting service",
      error: error.message,
    });
  }
};
