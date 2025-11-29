import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import FormField from "@/components/auth/FormField";
import { Button } from "@/components/ui/button";
import BackLink from "@/components/auth/BackLink";
import { useVerifyUserCode, useVerifyFarmerCode } from "@/hooks/useAuth";
import { storage, STORAGE_KEYS } from "@/utils/storage";




const VerifyCodePage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [isFarmer, setIsFarmer] = useState(false);
  const verifyUserMutation = useVerifyUserCode();
  const verifyFarmerMutation = useVerifyFarmerCode();
  useEffect(() => {
    const storedFarmerId = storage.get<string>(STORAGE_KEYS.FARMER_ID);
    if (storedFarmerId) {
      setFarmerId(storedFarmerId);
      setIsFarmer(true);
      return;
    }
    const storedUserId = storage.get<string>(STORAGE_KEYS.USER_ID);
    if (storedUserId) {
      setUserId(storedUserId);
      setIsFarmer(false);
      return;
    }
    navigate("/signup");
  }, [navigate]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!code) {
      setError("Please enter the verification code");
      return;
    }
    if (code.length !== 6) {
      setError("Code must be 6 digits");
      return;
    }
    if (isFarmer && farmerId) {
      verifyFarmerMutation.mutate({ farmerId, code });
    } else if (userId) {
      verifyUserMutation.mutate({ userId, otp: code });
    } else {
      setError("User ID not found. Please sign up again.");
      navigate("/signup");
    }
  };
  const handleResend = () => {
    setError("");
    setCode("");
  };
  const isLoading = verifyUserMutation.isPending || verifyFarmerMutation.isPending;
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
          <BackLink to="/login" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Verify Code
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 lg:mb-8">
            An authentication code has been sent to your email
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Code"
              id="code"
              type={showCode ? "text" : "password"}
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showCode ? "Hide code" : "Show code"}
                >
                  {showCode ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
            />
            <div className="text-sm text-gray-600">
              Didn't receive a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Resend
              </button>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading || (!userId && !farmerId)}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-0 h-full ">
      <img
  src="/src/assets/verify-code.jpg"
  alt="Auth Illustration"
  className="w-full h-[600px] object-cover block"
/>
      </div>
    </div>
  );
};
export default VerifyCodePage;
