import { Menu } from "../models/Menu.js";

export const addOrUpdateMenu = async (req, res) => {
  try {
    let { day, breakfast, lunch, snacks, dinner, special } = req.body;

    // Normalize day (Monday, Tuesday, Wednesday...)
    day = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

    let menu = await Menu.findOne({ day });

    if (menu) {
      // update
      menu.breakfast = breakfast;
      menu.lunch = lunch;
      menu.snacks = snacks;
      menu.dinner = dinner;
      menu.special = special;
      await menu.save();

      return res.json({ message: "Menu updated", menu });
    }

    // create new
    menu = await Menu.create({
      day,
      breakfast,
      lunch,
      snacks,
      dinner,
      special
    });

    res.json({ message: "Menu created", menu });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error", error: err.message });
  }
};

export const getWeeklyMenu = async (req, res) => {
  try {
    const week = await Menu.find();
    res.json(week);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

export const getTodayMenu = async (req, res) => {
  try {
    const todayName = new Date().toLocaleString("en-US", { weekday: "long" });
    const menu = await Menu.findOne({ day: todayName });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

export const reactToMeal = async (req, res) => {
  try {
    const { menuId, meal, reaction } = req.body;
    const userId = req.user?.id || req.user?._id;
    if (!menuId || !meal || !reaction) {
      return res.status(400).json({ message: "menuId, meal and reaction are required" });
    }

    const allowedMeals = ["breakfast", "lunch", "snacks", "dinner"];
    if (!allowedMeals.includes(meal)) {
      return res.status(400).json({ message: "Invalid meal" });
    }
    if (!["like", "dislike"].includes(reaction)) {
      return res.status(400).json({ message: "Invalid reaction" });
    }

    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    // Determine keys
    const likeKey = `${meal}Likes`;      // e.g. breakfastLikes
    const dislikeKey = `${meal}Dislikes`;

    // Remove any existing reaction for this user (both lists)
    const userIdStr = String(userId);
    menu[likeKey] = (menu[likeKey] || []).filter(r => String(r.userId) !== userIdStr);
    menu[dislikeKey] = (menu[dislikeKey] || []).filter(r => String(r.userId) !== userIdStr);

    // Add new reaction
    if (reaction === "like") {
      menu[likeKey].push({ userId });
    } else {
      menu[dislikeKey].push({ userId });
    }

    await menu.save();

    // Return updated counts and menu
    const result = {
      menuId: menu._id,
      breakfastLikes: menu.breakfastLikes.length,
      breakfastDislikes: menu.breakfastDislikes.length,
      lunchLikes: menu.lunchLikes.length,
      lunchDislikes: menu.lunchDislikes.length,
      snacksLikes: menu.snacksLikes.length,
      snacksDislikes: menu.snacksDislikes.length,
      dinnerLikes: menu.dinnerLikes.length,
      dinnerDislikes: menu.dinnerDislikes.length,
      menu
    };

    return res.json(result);

  } catch (err) {
    console.error("reactToMeal error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
