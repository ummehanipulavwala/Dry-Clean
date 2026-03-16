import mongoose from "mongoose";
import Order from "../models/Order.js";
import Feedback from "../models/Feedback.js";
import Service from "../models/servicemodel.js";
import ShopDetails from "../models/Shopdetails.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Advertisement from "../models/advertisementModel.js";
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
    const matchedUsers = await User.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { name: regex },
        { email: regex },
        { phone: regex }
      ]
    }).select("_id");

    const matchedUserIds = matchedUsers.map(u => u._id);

    const [services, shops, orders, users, feedback, payments, ads] = await Promise.all([
      Service.find({ name: regex }).limit(5),
      ShopDetails.find({ shopName: regex }).limit(5),
      Order.find({
        $or: [
          { _id: mongoose.isValidObjectId(searchText) ? searchText : undefined },
          { orderStatus: regex },
          { customer: { $in: matchedUserIds } }
        ].filter(Boolean)
      }).populate("customer", "name firstName lastName").limit(5),
      User.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { name: regex },
          { email: regex },
          { phone: regex }
        ]
      }).limit(5),
      Feedback.find({ comment: regex }).populate("userId", "name firstName lastName").limit(5),
      Payment.find({
        $or: [
          { paymentStatus: regex },
          { paymentMethod: regex },
          { _id: mongoose.isValidObjectId(searchText) ? searchText : undefined }
        ].filter(Boolean)
      }).populate("userId", "name firstName lastName").limit(5),
      Advertisement.find({ title: regex }).limit(5)
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
      payments,
      ads,
      count: services.length + shops.length + orders.length + users.length + feedback.length + payments.length + ads.length
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
