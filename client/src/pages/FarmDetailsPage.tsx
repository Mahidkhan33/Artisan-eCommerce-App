import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import FormField from "@/components/auth/FormField";
import TextAreaField from "@/components/auth/TextAreaField";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/components/auth/StepIndicator";
import { storage } from "@/utils/storage";
const validationSchema = Yup.object({
  farmName: Yup.string()
    .min(2, "Farm name must be at least 2 characters")
    .max(40, "Farm name must be less than 40 characters")
    .required("Farm name is required"),
  farmLocation: Yup.string()
    .min(2, "Farm location must be at least 2 characters")
    .max(40, "Farm location must be less than 40 characters")
    .required("Farm location is required"),
  farmDescription: Yup.string()
    .min(2, "Farm description must be at least 2 characters")
    .max(40, "Farm description must be less than 40 characters")
    .required("Farm description is required"),
});
const FarmDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const step1Data = storage.get("farmer_registration_step1");
    if (!step1Data) {
      navigate("/farmer-registration");
    }
  }, [navigate]);
  const formik = useFormik({
    initialValues: {
      farmName: "",
      farmLocation: "",
      farmDescription: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const step2Data = {
        farmName: values.farmName,
        farmLocation: values.farmLocation,
        farmDescription: values.farmDescription,
      };
      storage.set("farmer_registration_step2", step2Data);
      navigate("/bank-details");
    },
  });
  return (
    <div className="min-h-screen bg-white flex">
      <div className="w-full lg:w-1/2 flex flex-col px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 lg:py-10">
        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <div className="mb-4">
            <div className="flex items-center gap-3">
            <img
            src="/src/assets/Logo.png" 
            alt="LocalHarvest Logo"
            className="w-10 h-10 object-contain shrink-0" 
            />
              <span className="text-xl font-bold text-gray-900">LocalHarvest</span>
            </div>
          </div>
          <StepIndicator currentStep={2} totalSteps={3} backTo="/farmer-registration" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Farm Details
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 lg:mb-8">
            This information showcases your farm and products to our buyers.
          </p>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <FormField
                label="Farm Name"
                id="farmName"
                type="text"
                placeholder="General Farm"
                value={formik.values.farmName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.farmName && formik.errors.farmName && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.farmName}</p>
              )}
            </div>
            <div>
              <FormField
                label="Farm Location"
                id="farmLocation"
                type="text"
                placeholder="Enter your farm location"
                value={formik.values.farmLocation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.farmLocation && formik.errors.farmLocation && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.farmLocation}</p>
              )}
            </div>
            <div>
              <TextAreaField
                label="Farm Description"
                id="farmDescription"
                placeholder="Describe your farm, products, and farming practices..."
                value={formik.values.farmDescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                rows={6}
              />
              {formik.touched.farmDescription && formik.errors.farmDescription && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.farmDescription}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-base"
            >
              Next
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-0 h-full ">
      <img
  src="/src/assets/farm-details.jpg"
  alt="Auth Illustration"
  className="w-full h-[800px] object-cover block"
/>
      </div>
    </div>
  );
};
export default FarmDetailsPage;
