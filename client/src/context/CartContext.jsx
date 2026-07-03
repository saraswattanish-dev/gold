import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, token, syncCart, toggleWishlistServer } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // 1. Initial Load: If guest, load from localStorage. If logged in, fetch from User context.
  useEffect(() => {
    if (token && user) {
      // User is logged in: load user's cart and wishlist from database
      if (user.cart) {
        setCart(user.cart);
      }
      if (user.wishlist) {
        setWishlist(user.wishlist);
      }
    } else if (!token) {
      // Guest: load from localStorage
      const localCart = localStorage.getItem('cart');
      const localWishlist = localStorage.getItem('wishlist');
      if (localCart) setCart(JSON.parse(localCart));
      if (localWishlist) setWishlist(JSON.parse(localWishlist));
    }
  }, [user, token]);

  // 2. Synchronize guest cart/wishlist to localStorage when they change
  useEffect(() => {
    if (!token) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, token]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, token]);

  // 3. Sync cart items to server when they change (only if logged in)
  const syncCartWithServer = async (updatedCart) => {
    if (token) {
      await syncCart(updatedCart);
    }
  };

  // Cart Operations
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product._id === product._id);
      let newCart;

      if (existingItem) {
        newCart = prevCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prevCart, { product, quantity }];
      }

      syncCartWithServer(newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.product._id !== productId);
      syncCartWithServer(newCart);
      return newCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      );
      syncCartWithServer(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    syncCartWithServer([]);
  };

  // Wishlist Operations
  const toggleWishlist = async (product) => {
    if (token) {
      // Sync on server
      const updatedWishlist = await toggleWishlistServer(product._id);
      if (updatedWishlist) {
        setWishlist(updatedWishlist);
      }
    } else {
      // Local state toggle
      setWishlist((prevWishlist) => {
        const exists = prevWishlist.some((item) => item._id === product._id);
        if (exists) {
          return prevWishlist.filter((item) => item._id !== product._id);
        } else {
          return [...prevWishlist, product];
        }
      });
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  // Derived Values
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
