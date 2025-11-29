import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import FormField from "@/components/auth/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLoginFarmer } from "@/hooks/useAuth";
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});
const FarmerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const loginFarmerMutation = useLoginFarmer();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema,
    onSubmit: (values) => {
      loginFarmerMutation.mutate({
        email: values.email,
        password: values.password,
      });
    },
  });
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
            Farmer Login
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 lg:mb-8">
            Login to manage your farm and products
          </p>
          {}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {}
            <div>
              <FormField
                label="Email"
                id="email"
                type="email"
                placeholder="farmer@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.email}</p>
              )}
            </div>
            {}
            <div>
              <FormField
                label="Password"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.password}</p>
              )}
            </div>
            {}
            <div className="flex items-center justify-between">
              <Checkbox
                id="rememberMe"
                checked={formik.values.rememberMe}
                onChange={(e) => formik.setFieldValue("rememberMe", e.target.checked)}
                label="Remember me"
              />
              <Link
                to="/farmer-forgot-password"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            {}
            <Button
              type="submit"
              disabled={loginFarmerMutation.isPending}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginFarmerMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
          {}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Don't have a farmer account?{" "}
              <Link
                to="/farmer-registration"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Register as Farmer
              </Link>
            </span>
          </div>
        </div>
      </div>
      {}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-0 h-full ">
      <img
  src="/src/assets/farmer-login.jpg"
  alt="Auth Illustration"
  className="w-full h-[650px] object-cover block"
/>
      </div>
    </div>
  );
};
export default FarmerLoginPage;
