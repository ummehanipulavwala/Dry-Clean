import Service from "../models/servicemodel.js";
import User from "../models/User.js";

// Search Services Controller
// GET /api/search/services?q=searchText
export const searchServices = async (req, res) => {
  try {
    const searchText = req.query.q?.trim();
    const userId = req.user.id;

    if (!searchText) {
      return res.status(400).json({ message: "Search text is required" });
    }

    // Search logic
    const results = await Service.find({
      serviceName: { $regex: searchText, $options: "i" }
    });

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

    res.status(200).json({
      count: results.length,
      results
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET RECENT SEARCHES       GET /api/search/recent
 
export const getRecentSearches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("recentSearches");

    res.status(200).json(user.recentSearches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
