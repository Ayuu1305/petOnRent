import { createContext, useContext, useState, useEffect } from "react";

// Create Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  // Load cart count from localStorage on mount
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  }, []);

  // Function to update cart count
  const updateCartCount = (count) => {
    setCartCount(count); // ✅ Properly updates state
  };

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook to use Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
