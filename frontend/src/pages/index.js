import HeroSection from "../components/HeroSection";
import PetCategories from "../components/PetCategories";
import FeaturedPets from "../components/FeaturedPets";
import CTASection from "../components/CTASection";
import Cart from "../components/Cart";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const Home = () => {
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    // Check for openCart parameter in URL
    const { openCart } = router.query;
    if (openCart === "true") {
      setCartOpen(true);
      // Remove the parameter from URL
      router.replace("/", undefined, { shallow: true });
    }
  }, [router.query]);

  return (
    <>
      <HeroSection />
      <PetCategories />
      <FeaturedPets />
      <CTASection />

      {/* Cart Component */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Home;
