import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import FormField from "@/components/auth/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useRegisterUser } from "@/hooks/useAuth";
const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .test("has-last-name", "Please enter both first and last name", (value) => {
      if (!value) return false;
      const parts = value.trim().split(" ");
      return parts.length >= 2 && parts[0].length > 0 && parts.slice(1).join(" ").length > 0;
    }),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  agreeToTerms: Yup.boolean().oneOf([true], "You must agree to the terms and conditions"),
});
const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegisterUser();
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    validationSchema,
    onSubmit: (values) => {
      const nameParts = values.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      registerMutation.mutate({
        fullName: { firstName, lastName },
        email: values.email,
        phoneNumber: values.phoneNumber,
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
          {}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Sign up
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 lg:mb-8">
            Create an account to get started
          </p>
          {}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {}
            <div>
              <FormField
                label="Name"
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.name}</p>
              )}
            </div>
            {}
            <div>
              <FormField
                label="Email"
                id="email"
                type="email"
                placeholder="john.doe@gmail.com"
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
                label="Phone Number"
                id="phoneNumber"
                type="tel"
                placeholder="03335603955"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.phoneNumber}</p>
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
            <div>
              <FormField
                label="Confirm Password"
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.confirmPassword}</p>
              )}
            </div>
            {}
            <div className="flex items-start gap-2">
              <Checkbox
                id="agreeToTerms"
                checked={formik.values.agreeToTerms}
                onChange={(e) => formik.setFieldValue("agreeToTerms", e.target.checked)}
                className="mt-1"
              />
              <label
                htmlFor="agreeToTerms"
                className="text-sm text-gray-600 cursor-pointer"
              >
                I agree to the{" "}
                <a href="#" className="text-red-600 hover:text-red-700 font-medium">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-red-600 hover:text-red-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>
            {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
              <p className="text-sm text-red-600">{formik.errors.agreeToTerms}</p>
            )}
            {}
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? "Signing up..." : "Sign up"}
            </Button>
          </form>
          {}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Login
              </Link>
            </span>
          </div>
         
        </div>
      </div>
      {}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-0 h-full ">
      <img
  src="/src/assets/signup.jpg"
  alt="Auth Illustration"
  className="w-full h-[900px] object-cover block"
/>
      </div>
    </div>
  );
};
export default SignupPage;
