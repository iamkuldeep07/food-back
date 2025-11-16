import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { ...form, role: "student" });
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
      
      {/* MAIN CARD */}
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/30 backdrop-blur-xl p-10 rounded-2xl shadow-xl w-full max-w-md border border-white/40"
      >
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-3xl font-bold text-gray-900 text-center mb-6"
        >
          Create Account ✨
        </motion.h2>

        {/* Name */}
        <motion.input
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-green-500 outline-none bg-white/60"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* Email */}
        <motion.input
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-green-500 outline-none bg-white/60"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* Password */}
        <motion.input
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-green-500 outline-none bg-white/60"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {/* Register Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full p-3 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition"
        >
          Register
        </motion.button>

        {/* Already have account? */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-center mt-4 text-gray-700"
        >
          Already have an account?
          <Link to="/login" className="text-green-700 font-semibold ml-1 hover:underline">
            Login
          </Link>
        </motion.p>

      </motion.form>
    </div>
  );
}