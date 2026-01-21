import Service from "../models/servicemodel.js";

//create service for admin
export const createService = async (req, res) => {
  try {
    if (req.user.role !== "shop") {
      return res.status(403).json({ message: "Only shops can add services" });
    }
    const { name, description, price } = req.body;

    const services = await Service.create({
      shop: req.user.id,
      name,
      price,
      description,
      image: req.file ? `/uploads/services/${req.file.filename}` : null,
    });

    if (!name || !price) {
      return res.status(400).json({
        message: "Service name and price are required",
      });
    }

    const existingService = await Service.findOne({ name });

    if (existingService) {
      return res.status(409).json({
        message: "Service already exists",
      });
    }
      res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create get all services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });

    res.status(200).json({
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching services",
      error: error.message,
    });
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
  }
};
