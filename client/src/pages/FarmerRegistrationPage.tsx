import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import FormField from "@/components/auth/FormField";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/components/auth/StepIndicator";
import { storage } from "@/utils/storage";
const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits"),
  cnic: Yup.string()
    .required("CNIC is required")
    .length(13, "CNIC must be exactly 13 digits"),
  agreeToTerms: Yup.boolean().oneOf([true], "You must agree to the terms and conditions"),
});
const FarmerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      cnic: "",
      agreeToTerms: false,
    },
    validationSchema,
    onSubmit: (values) => {
      const step1Data = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        cnic: values.cnic,
      };
      storage.set("farmer_registration_step1", step1Data);
      navigate("/farm-details");
    },
  });
  const handleSocialLogin = (provider: "facebook" | "google" | "apple") => {
  };
  return (
    <div className="min-h-screen bg-white flex">
      <div className="w-full lg:w-1/2 flex flex-col px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 lg:py-10">
        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <div className="mb-4 lg:mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              <img
            src="/src/assets/Logo.png" 
            alt="LocalHarvest Logo"
            className="w-10 h-10 object-contain shrink-0" 
            />
                <span className="text-xl font-bold text-gray-900">LocalHarvest</span>
              </div>
            
            </div>
          </div>
          <StepIndicator currentStep={1} totalSteps={3} backTo="/" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Join as a Farmer
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 lg:mb-8">
            Register to sell your organic products directly to consumers
          </p>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FormField
                  label="First Name"
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.firstName}</p>
                )}
              </div>
              <div>
                <FormField
                  label="Last Name"
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{formik.errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
            <div>
              <FormField
                label="CNIC"
                id="cnic"
                type="text"
                placeholder="XXXXX-XXXXXXX-X"
                value={formik.values.cnic}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.cnic && formik.errors.cnic && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.cnic}</p>
              )}
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="agreeToTerms"
                checked={formik.values.agreeToTerms}
                onChange={(e) => formik.setFieldValue("agreeToTerms", e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-600 cursor-pointer">
                I agree to all the{" "}
                <a href="#" className="text-red-600 hover:text-red-700 font-medium">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-red-600 hover:text-red-700 font-medium">
                  Privacy Policies
                </a>
              </label>
            </div>
            {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
              <p className="text-sm text-red-600">{formik.errors.agreeToTerms}</p>
            )}
            <Button
              type="submit"
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-base"
            >
              Next
            </Button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/farmer-login"
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Login
              </Link>
            </span>
          </div>     
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-0 h-full ">
      <img
  src="/src/assets/farmer-registration.jpg"
  alt="Auth Illustration"
  className="w-full h-[800px] object-cover block"
/>
      </div>
      </div>
  );
};
export default FarmerRegistrationPage;
