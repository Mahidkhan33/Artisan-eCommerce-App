import React from "react";
import { Leaf, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "../container/Container";
interface HeroSectionProps {
  onShopNow?: () => void;
  onLearnMore?: () => void;
}
const HeroSection: React.FC<HeroSectionProps> = ({
  onShopNow,
  onLearnMore,
}) => {
  const features = [
    {
      icon: <Leaf className="h-6 w-6 text-green-600" />,
      text: "100% Organic Produce",
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      text: "Direct From Farmers",
    },
    {
      icon: <Package className="h-6 w-6 text-green-600" />,
      text: "Farm Fresh & Locally Sourced",
    },
  ];
  const stats = [
    { value: "500+", label: "Local Farmers" },
    { value: "10k+", label: "Happy Customers" },
    { value: "99%", label: "Locally Sourced" },
  ];
  return (
    <section className="w-full bg-green-50 py-12 md:py-16 lg:py-20">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {}
          <div className="flex flex-col gap-6 md:gap-8">
            {}
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
              Fresh <span className="text-green-600">Organic</span> Produce
              Direct From Farmers
            </h1>
            {}
            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
              Connect directly with local organic farmers. No middlemen, no
              markup - just fresh, sustainable produce delivered straight from
              the farm to your table.
            </p>
            {}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 border-2 border-green-600 rounded-lg bg-white"
                >
                  {feature.icon}
                  <span className="text-sm md:text-base font-medium text-gray-900">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
            {}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onShopNow}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base md:text-lg"
              >
                Shop Now
              </Button>
              <Button
                onClick={onLearnMore}
                variant="outline"
                size="lg"
                className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-6 text-base md:text-lg"
              >
                Join as a Farmer
              </Button>
            </div>
            {}
            <div className="flex flex-col sm:flex-row gap-6 md:gap-8 pt-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stat.value}
                  </span>
                  <span className="text-sm md:text-base text-gray-600">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {}
          <div className="hidden lg:flex justify-center items-center">
            <div className="w-full max-w-md h-96 md:h-[500px] bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={new URL('../../assets/hero.jpg', import.meta.url).href}
                alt="Fresh organic produce"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
export default HeroSection;
