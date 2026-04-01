import mongoose from "mongoose";
import Order from "../models/Order.js";
import Feedback from "../models/Feedback.js";
import Service from "../models/servicemodel.js";
import ShopDetails from "../models/Shopdetails.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Advertisement from "../models/advertisementModel.js";
import Search from "../models/Search.js"; // New model
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

    // Save the search event to the new Search model
    const totalCount =
      services.length +
      shops.length +
      orders.length +
      users.length +
      feedback.length +
      payments.length +
      ads.length;

    await Search.create({
      userId,
      searchText,
    });

    // We no longer update User's recentSearches here. 
    // It's handled entirely by the Search model logging above.

    sendSuccess(res, 200, "Search results", {
      services,
      shops,
      orders,
      users,
      feedback,
      payments,
      ads,
      count: totalCount
    });

  } catch (error) {
    sendError(res, 500, error.message);
  }
};

//GET RECENT SEARCHES       GET /api/search/recent

export const getRecentSearches = async (req, res) => {
  try {
    const userId = req.user.id;
    // We want the 5 most recent unique search texts with their IDs from the Search logs.
    const searches = await Search.find({ userId })
      .sort({ createdAt: -1 })
      .select("_id searchText");

    // Extract unique strings but keep the specific ID mapping
    const uniqueSearches = [];
    const seenTexts = new Set();

    for (const search of searches) {
      if (!seenTexts.has(search.searchText)) {
        seenTexts.add(search.searchText);
        uniqueSearches.push({
          _id: search._id,
          searchText: search.searchText
        });
      }
      if (uniqueSearches.length === 5) break; // Limit to 5 visually
    }

    sendSuccess(res, 200, "Recent searches", uniqueSearches);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

//DELETE RECENT SEARCH      DELETE /api/search/recent/:id
export const deleteRecentSearch = async (req, res) => {
  try {
    const id = req.params.id?.trim();
    const userId = req.user.id;

    if (!id) {
      return sendError(res, 400, "Search ID is required");
    }

    // Delete by specific Search log ID
    await Search.findOneAndDelete({ _id: id, userId });

    // Return the updated recent searches list
    const searches = await Search.find({ userId })
      .sort({ createdAt: -1 })
      .select("_id searchText");

    const uniqueSearches = [];
    const seenTexts = new Set();

    for (const search of searches) {
      if (!seenTexts.has(search.searchText)) {
        seenTexts.add(search.searchText);
        uniqueSearches.push({
          _id: search._id,
          searchText: search.searchText
        });
      }
      if (uniqueSearches.length === 5) break;
    }

    return sendSuccess(res, 200, "Recent search deleted", uniqueSearches);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

//GET SEARCH LOGS           GET /api/search/logs
export const getSearchLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    // Fetch user's search history logging from Search schema, sorted by latest
    const logs = await Search.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // limit to recent 50 for performance

    sendSuccess(res, 200, "Search logs retrieved", logs);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};
