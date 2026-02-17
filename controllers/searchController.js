import Service from "../models/servicemodel.js";
import User from "../models/User.js";
import ShopDetails from "../models/Shopdetails.js";
<<<<<<< HEAD
import { sendSuccess, sendError } from "../utils/responseHandler.js";
=======
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e

// Search Services Controller
// GET /api/search/services?q=searchText
export const searchServices = async (req, res) => {
  try {
    const searchText = req.query.q?.trim();
    const userId = req.user.id;

    if (!searchText) {
<<<<<<< HEAD
      return sendError(res, 400, "Search text is required");
=======
      return res.status(400).json({ message: "Search text is required" });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
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

<<<<<<< HEAD
    sendSuccess(res, 200, "Search results", { services, shops, count: services.length + shops.length });

  } catch (error) {
    sendError(res, 500, error.message);
=======
    res.status(200).json({
      count: services.length + shops.length,
      services,
      shops
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};

//GET RECENT SEARCHES       GET /api/search/recent

export const getRecentSearches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("recentSearches");

<<<<<<< HEAD
    sendSuccess(res, 200, "Recent searches", user.recentSearches);
  } catch (error) {
    sendError(res, 500, error.message);
=======
    res.status(200).json(user.recentSearches);
  } catch (error) {
    res.status(500).json({ message: error.message });
>>>>>>> 30942aec6a614d58d068ec75d3d899063eeabd0e
  }
};
