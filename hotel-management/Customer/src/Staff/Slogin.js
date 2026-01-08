import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Hotel } from "lucide-react";

const API = "http://localhost:5000"; // ✅ BACKEND BASE URL

const SLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API}/api/staff/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Invalid email or password");
        return;
      }

      // ✅ SUCCESS
      localStorage.setItem("staffToken", data.token);
      localStorage.setItem("staffUser", JSON.stringify(data.staff));

      navigate("/staff/dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setErrorMessage("Connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/95 shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <Hotel className="text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Staff Portal
              </h2>
              <p className="text-gray-500 mt-1">
                Sign in with your staff credentials
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-70"
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-slate-100 rounded-lg text-xs text-slate-600">
              <p className="font-bold mb-1">Demo Credentials</p>
              <p>Email: admin@luxe.com</p>
              <p>Password: staff123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLogin;
