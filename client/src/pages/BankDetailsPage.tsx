import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import FormField from "@/components/auth/FormField";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/components/auth/StepIndicator";
import { useRegisterFarmer } from "@/hooks/useAuth";
import { storage } from "@/utils/storage";
const validationSchema = Yup.object({
  accountHolderName: Yup.string()
    .min(2, "Account holder name must be at least 2 characters")
    .required("Account holder name is required"),
  accountNumber: Yup.string()
    .min(2, "Account number must be at least 2 characters")
    .required("Account number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});
const BankDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const registerFarmerMutation = useRegisterFarmer();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  useEffect(() => {
    const step1Data = storage.get("farmer_registration_step1");
    const step2Data = storage.get("farmer_registration_step2");
    if (!step1Data || !step2Data) {
      navigate("/farmer-registration");
    }
  }, [navigate]);
  const formik = useFormik({
    initialValues: {
      accountHolderName: "",
      accountNumber: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const step1Data = storage.get("farmer_registration_step1");
      const step2Data = storage.get("farmer_registration_step2");
      if (!step1Data || !step2Data) {
        navigate("/farmer-registration");
        return;
      }
      const registrationData = {
        fullName: {
          firstName: step1Data.firstName,
          lastName: step1Data.lastName,
        },
        cnic: step1Data.cnic,
        email: step1Data.email,
        phoneNumber: step1Data.phoneNumber,
        farmName: step2Data.farmName,
        farmLocation: step2Data.farmLocation,
        farmDescription: step2Data.farmDescription,
        accountHolderName: values.accountHolderName,
        bankAccountNumber: values.accountNumber,
        password: values.password,
      };
      registerFarmerMutation.mutate(registrationData, {
        onSuccess: () => {
          storage.remove("farmer_registration_step1");
          storage.remove("farmer_registration_step2");
        },
      });
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
          <StepIndicator currentStep={3} totalSteps={3} backTo="/farm-details" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Bank Details
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 lg:mb-8">
            This secure step ensures you receive timely payments for your sales and sets up your account login
          </p>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <FormField
                label="Account Holder Name"
                id="accountHolderName"
                type="text"
                placeholder="John Doe"
                value={formik.values.accountHolderName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.accountHolderName && formik.errors.accountHolderName && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.accountHolderName}</p>
              )}
            </div>
            <div>
              <FormField
                label="Account Number"
                id="accountNumber"
                type="text"
                placeholder="PK36SCBL0000001123456702"
                value={formik.values.accountNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
              />
              {formik.touched.accountNumber && formik.errors.accountNumber && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.accountNumber}</p>
              )}
            </div>
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
            <Button
              type="submit"
              disabled={registerFarmerMutation.isPending}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerFarmerMutation.isPending ? "Registering..." : "Sign up"}
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-0 h-full ">
      <img
  src="/src/assets/bank-details.jpg"
  alt="Auth Illustration"
  className="w-full h-[800px] object-cover block"
/>
      </div>
    </div>
  );
};
export default BankDetailsPage;
