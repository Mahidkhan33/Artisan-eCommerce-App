import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import FormField from "@/components/auth/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLoginUser } from "@/hooks/useAuth";
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const loginMutation = useLoginUser();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    loginMutation.mutate({ email, password });
  };
  const handleSocialLogin = (provider: "facebook" | "google" | "apple") => {
  };
  return (
    <div className="min-h-screen bg-white flex">
      {}
      <div className="w-full lg:w-1/2 flex flex-col px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 lg:py-10">
        <div className="max-w-sm w-full mx-auto lg:mx-0">
          {}
          <div className="mb-4 lg:mb-6">
            <div className="flex items-center gap-3">
            <img
            src="/src/assets/Logo.png" 
            alt="LocalHarvest Logo"
            className="w-10 h-10 object-contain shrink-0" 
            />
              <span className="text-xl font-bold text-gray-900">LocalHarvest</span>
            </div>
          </div>
          <div className="mb-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
          </div>
          {}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Login
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 lg:mb-8">
            Login to access your account
          </p>
          {}
          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            <FormField
              label="Email"
              id="email"
              type="email"
              placeholder="john.doe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {}
            <FormField
              label="Password"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
            />
            {}
            <div className="flex items-center justify-between">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                label="Remember me"
              />
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            {}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}
            {}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
          {}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Sign up
              </Link>
            </span>
          </div>
         
        </div>
      </div>
      {}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-0 h-full ">
      <img
  src="/src/assets/login.jpg"
  alt="Auth Illustration"
  className="w-full h-[650px] object-cover block"
/>
      </div>
    </div>
  );
};
export default LoginPage;
