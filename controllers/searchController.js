import mongoose from "mongoose";
import Order from "../models/Order.js";
import Feedback from "../models/Feedback.js";
import Service from "../models/servicemodel.js";
import ShopDetails from "../models/Shopdetails.js";
import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

// Global Search Controller
// GET /api/search?q=searchText
export const searchServices = async (req, res) => {
  try {
    const searchText = req.query.q?.trim();
    if (!searchText) {
      return sendSuccess(res, 200, "Empty search", {
        services: [], shops: [], orders: [], users: [], feedback: [], count: 0
      });
    }

    const userId = req.user.id;
    const regex = { $regex: searchText, $options: "i" };

    // Search logic across all entities
    const [services, shops, orders, users, feedback] = await Promise.all([
      Service.find({ serviceName: regex }).limit(5),
      ShopDetails.find({ shopName: regex }).limit(5),
      Order.find({
        $or: [
          { _id: mongoose.isValidObjectId(searchText) ? searchText : undefined },
          { orderStatus: regex }
        ].filter(Boolean)
      }).populate("customer", "name firstName lastName").limit(5),
      User.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { name: regex },
          { email: regex }
        ]
      }).limit(5),
      Feedback.find({ comment: regex }).populate("userId", "name firstName lastName").limit(5)
    ]);

    // Update recent searches
    await User.findByIdAndUpdate(userId, {
      $pull: { recentSearches: searchText }
    });
    await User.findByIdAndUpdate(userId, {
      $push: {
        recentSearches: { $each: [searchText], $position: 0, $slice: 5 }
      }
    });

    sendSuccess(res, 200, "Search results", {
      services,
      shops,
      orders,
      users,
      feedback,
      count: services.length + shops.length + orders.length + users.length + feedback.length
    });

  } catch (error) {
    sendError(res, 500, error.message);
  }
};

//GET RECENT SEARCHES       GET /api/search/recent

export const getRecentSearches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("recentSearches");

    sendSuccess(res, 200, "Recent searches", user.recentSearches);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
