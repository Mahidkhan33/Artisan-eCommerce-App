import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import FormField from "@/components/auth/FormField";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/hooks/useAuth";
const validationSchema = Yup.object({
  createPassword: Yup.string()
    .min(8, "Password must be at least 8 characters long")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("createPassword")], "Passwords must match")
    .required("Please confirm your password"),
});
const SetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetPasswordMutation = useResetPassword();
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");
  useEffect(() => {
    if (!token || !userId) {
      navigate("/forgot-password");
    }
  }, [token, userId, navigate]);
  const formik = useFormik({
    initialValues: {
      createPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (!token || !userId) {
        return;
      }
      resetPasswordMutation.mutate({
        userId,
        token,
        newPassword: values.createPassword,
      });
    },
  });
  const [showCreatePassword, setShowCreatePassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  return (
    <div className="min-h-screen bg-white flex">
      <div className="w-full lg:w-1/2 flex flex-col px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 lg:py-10">
        <div className="max-w-sm w-full mx-auto lg:mx-0">
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Set a password
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 lg:mb-8">
            Please set a new password for your account
          </p>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <FormField
                label="Create Password"
                id="createPassword"
                type={showCreatePassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formik.values.createPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showCreatePassword ? "Hide password" : "Show password"}
                  >
                    {showCreatePassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
              />
              {formik.touched.createPassword && formik.errors.createPassword && (
                <p className="text-sm text-red-600 mt-1">{formik.errors.createPassword}</p>
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
              disabled={resetPasswordMutation.isPending || !token || !userId}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetPasswordMutation.isPending ? "Resetting..." : "Set password"}
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-0 h-full ">
      <img
  src="/src/assets/set-password.jpg"
  alt="Auth Illustration"
  className="w-full h-[600px] object-cover block"
/>
      </div>
    </div>
  );
};
export default SetPasswordPage;
