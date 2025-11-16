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
