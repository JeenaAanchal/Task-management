"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "react-toastify";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        email,
        password,
      });

      // If backend returns tokens
      if (res.data.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
      }

      toast.success("Registration successful");
      router.replace("/dashboard");

    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Create Account
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-black outline-none"
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-black outline-none"
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-black hover:bg-slate-800 text-white py-3 rounded-xl transition"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </div>

        <p className="text-sm text-center mt-6 text-slate-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-black font-medium hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}