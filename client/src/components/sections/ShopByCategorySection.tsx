import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Container from "../container/Container";
import { useNavigate } from "react-router-dom";
export interface Category {
  id: string;
  title: string;
  description: string;
  image?: string;
  to: string;
}
interface ShopByCategorySectionProps {
  categories?: Category[];
  onCategoryClick?: (category: Category) => void;
}
const defaultCategories: Category[] = [
  {
    id: "1",
    title: "Fresh Vegetables",
    description: "Farm-fresh vegetables delivered daily",
    to: "/vegetables",
    image: "./assets/vegetables.jpg",
  },
  {
    id: "2",
    title: "Nutritious Fruits",
    description: "Organic fruits picked at peak ripeness",
    to: "/fruits",
    image: "./assets/fruits.jpg",
  },
  {
    id: "3",
    title: "Dairy Products",
    description: "Fresh dairy products from local farms",
    to: "/dairy",
    image: "./assets/dairy-products.jpg",
  },
  {
    id: "4",
    title: "Healthy Spices",
    description: "Aromatic spices and herbs",
    to: "/herbs",
    image: "./assets/spices.jpg",
    },
];
const ShopByCategorySection: React.FC<ShopByCategorySectionProps> = ({
  categories = defaultCategories,
  onCategoryClick,
}) => {
  const navigate = useNavigate();
  return (
    <section className="w-full bg-white py-12 md:py-16 lg:py-20">
      <Container>
        {}
        <div className="text-center mb-10 md:mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Shop By Category
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of organic products organized by category for
            your convenience
          </p>
        </div>
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {}
              <div className="w-full h-48 bg-gray-200 overflow-hidden">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  onClick={ () => navigate(category.to)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Shop Category
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};
export default ShopByCategorySection;
