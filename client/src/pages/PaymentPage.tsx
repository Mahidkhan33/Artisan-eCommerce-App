import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Container from "@/components/container/Container";
import StripePaymentForm from "@/components/payment/StripePaymentForm";
import { CartSummary } from "@/components/checkout";
import { useAppSelector } from "@/store/hooks";
import {
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
} from "@/store/slices/cartSlice";
import type { CheckoutAddress } from "@/types/checkout.types";
import { toast } from "react-toastify";
import { ShoppingBag } from "lucide-react";
import { useCreatePaymentIntent, useConfirmPayment } from "@/hooks/usePayment";
interface LocationState {
  address?: CheckoutAddress;
}
const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasStripeConfig = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">(
    hasStripeConfig ? "card" : "cash"
  );
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const cartItems = useAppSelector(selectCartItems);
  const cartTotals = useAppSelector(selectCartTotal);
  const cartItemCount = useAppSelector(selectCartItemCount);
  const discountPercentage = useAppSelector((state) => state.cart.discount);
  const address = (location.state as LocationState)?.address;
  const createPaymentIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();
  const handleLogoClick = () => {
    navigate("/");
  };
  const handleAccountClick = () => {
    navigate("/login");
  };
  const handleCartClick = () => {
    navigate("/cart");
  };
  useEffect(() => {
    if (!address || cartItems.length === 0) {
      setClientSecret("");
      setPaymentIntentId("");
      return;
    }
    const requiredFields = ['streetAddress', 'houseNo', 'town', 'city', 'country', 'postalCode'];
    const missingFields = requiredFields.filter(field => !address[field as keyof CheckoutAddress]);
    if (missingFields.length > 0) {
      console.error("Invalid address - missing fields:", missingFields);
      toast.error(`Please complete all address fields. Missing: ${missingFields.join(", ")}`);
      setClientSecret("");
      setPaymentIntentId("");
      return;
    }
    
    if (clientSecret && paymentIntentId) {
      return;
    }
    
    const createIntent = async () => {
      try {
        const response = await createPaymentIntent.mutateAsync({
          shippingAddress: address,
          paymentMethod,
        });
        setClientSecret(response.clientSecret);
        setPaymentIntentId(response.paymentIntentId);
      } catch (error: any) {
        console.error("Error creating payment intent:", error);
        const errorMessage = error.response?.data?.message || 
          (error.response?.data?.errors && Array.isArray(error.response.data.errors)
            ? error.response.data.errors.map((e: any) => e.message).join(", ")
            : null) ||
          "Failed to setup payment. Please try again.";
        toast.error(errorMessage);
        setClientSecret("");
        setPaymentIntentId("");
      }
    };
    
    createIntent();
  }, [address, paymentMethod]);
  
  useEffect(() => {
    if (clientSecret && paymentIntentId) {
      setClientSecret("");
      setPaymentIntentId("");
    }
  }, [paymentMethod]);
  const handlePaymentMethodChange = (method: "card" | "cash") => {
    setPaymentMethod(method);
  };
  const handleCashPayment = async () => {
    if (!address || !paymentIntentId) {
      toast.error("Payment setup incomplete. Please try again.");
      return;
    }
    try {
      const response = await confirmPayment.mutateAsync({
        paymentIntentId,
        shippingAddress: address,
      });
      toast.success("Order placed successfully! You will pay cash on delivery.");
      navigate("/order-confirmation", {
        state: {
          order: response.order,
          address,
          paymentMethod: "cash",
        },
      });
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      const errorMessage = error.response?.data?.message || 
        (error.response?.data?.errors && Array.isArray(error.response.data.errors)
          ? error.response.data.errors.map((e: any) => e.message).join(", ")
          : null) ||
        "Failed to place order. Please try again.";
      toast.error(errorMessage);
    }
  };
  const handleCardPaymentSuccess = async () => {
    if (!address || !paymentIntentId) {
      toast.error("Payment setup incomplete. Please try again.");
      return;
    }
    try {
      const response = await confirmPayment.mutateAsync({
        paymentIntentId,
        shippingAddress: address,
      });
      toast.success("Payment successful! Order placed.");
      navigate("/order-confirmation", {
        state: {
          order: response.order,
          address,
          paymentMethod: "card",
        },
      });
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      const errorMessage = error.response?.data?.message || 
        (error.response?.data?.errors && Array.isArray(error.response.data.errors)
          ? error.response.data.errors.map((e: any) => e.message).join(", ")
          : null) ||
        "Failed to confirm payment. Please try again.";
      toast.error(errorMessage);
    }
  };
  React.useEffect(() => {
    if (!address) {
      toast.error("Please complete checkout first");
      navigate("/checkout");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
    }
  }, [address, cartItems.length, navigate]);
  return (
    <div className="w-full flex flex-col min-h-screen bg-white">
      <Header
        cartCount={cartItemCount}
        onAccountClick={handleAccountClick}
        onCartClick={handleCartClick}
        onLogoClick={handleLogoClick}
      />
      <main className="flex-1 py-8 sm:py-12 bg-white">
        <Container>
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Payment
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Complete your payment to place the order
            </p>
          </div>
          {(!address || cartItems.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24">
              <ShoppingBag className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                {!address ? "Address required" : "Your cart is empty"}
              </h2>
              <p className="text-gray-600 mb-6 text-center px-4">
                {!address
                  ? "Please complete checkout first"
                  : "Add items to your cart to proceed with payment."}
              </p>
              <button
                onClick={() => navigate(!address ? "/checkout" : "/")}
                className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
              >
                {!address ? "Go to Checkout" : "Continue Shopping"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8">
                  {clientSecret ? (
                    <StripePaymentForm
                      clientSecret={clientSecret}
                      paymentMethod={paymentMethod}
                      onPaymentMethodChange={handlePaymentMethodChange}
                      onSubmit={handleCardPaymentSuccess}
                      isLoading={confirmPayment.isPending || createPaymentIntent.isPending}
                      onCashPayment={handleCashPayment}
                    />
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-gray-600">Setting up payment...</p>
                    </div>
                  )}
                </div>
              </div>
              {}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <CartSummary
                    items={cartItems}
                    subtotal={cartTotals.subtotal}
                    discount={cartTotals.discount}
                    discountPercentage={discountPercentage}
                    deliveryFee={cartTotals.deliveryFee}
                    total={cartTotals.total}
                  />
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};
export default PaymentPage;
