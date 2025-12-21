import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { FeaturedProductsSection, HeroSection, ShopByCategorySection, WhyChooseUsSection } from '@/components/sections'
import { useNavigate } from 'react-router-dom'
import React from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectCartItemCount } from '@/store/slices/cartSlice'



const LandingPage:React.FC = () => {
    const navigate = useNavigate()
    const cartItemCount = useAppSelector(selectCartItemCount)
    const handleShopNow = () => {
      }
      const handleLearnMore = () => {
        navigate('/farmer-registration')
      }
      const handleAccountClick = () => {
        navigate('/login')
      }
      const handleCartClick = () => {
        navigate('/cart')
      }
      const handleLogoClick = () => {
        navigate('/')
      }
      const handleSearch = (searchQuery: string) => {
        if (searchQuery.trim()) {
          navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        }
      }
      const handleCategoryClick = () => {
      }
      const handleViewAll = () => {
        navigate('/search')
      }
  return (
    <div className="w-full flex flex-col min-h-screen">
    <Header 
      cartCount={cartItemCount}
      onAccountClick={handleAccountClick}
      onCartClick={handleCartClick}
      onLogoClick={handleLogoClick}
      onSearch={handleSearch}
    />
    <main className="w-full flex-1">
      <HeroSection
        onShopNow={handleShopNow}
        onLearnMore={handleLearnMore}
      />
      <ShopByCategorySection
        onCategoryClick={handleCategoryClick}
      />
      <FeaturedProductsSection
        onViewAll={handleViewAll}
      />
      <WhyChooseUsSection />
    </main>
    <Footer/>
  </div>
  )
}
export default LandingPage
