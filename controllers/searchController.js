import Service from "../models/servicemodel.js";
import User from "../models/User.js";
import ShopDetails from "../models/Shopdetails.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

// Search Services Controller
// GET /api/search/services?q=searchText
export const searchServices = async (req, res) => {
  try {
    const searchText = req.query.q?.trim();
    const userId = req.user.id;

    if (!searchText) {
      return sendError(res, 400, "Search text is required");
    }

    // Search logic
    const [services, shops] = await Promise.all([
      Service.find({
        name: { $regex: searchText, $options: "i" }
      }),
      ShopDetails.find({
        shopName: { $regex: searchText, $options: "i" }
      })
    ]);

    // Update recent searches
    await User.findByIdAndUpdate(userId, {
      $pull: { recentSearches: searchText }
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        recentSearches: {
          $each: [searchText],
          $position: 0,
          $slice: 5 // keep last 5 searches
        }
      }
    });

    sendSuccess(res, 200, "Search results", { services, shops, count: services.length + shops.length });

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
