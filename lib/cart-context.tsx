"use client"

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { Product } from "@/lib/products"

export interface CartItem {
  product: Product
  quantity: number
}

export interface AppliedCoupon {
  code: string
  description: string
  type: "percentage" | "fixed"
  value: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  coupon: AppliedCoupon | null
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "SET_OPEN"; isOpen: boolean }
  | { type: "LOAD_CART"; items: CartItem[]; coupon: AppliedCoupon | null }
  | { type: "APPLY_COUPON"; coupon: AppliedCoupon }
  | { type: "REMOVE_COUPON" }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + action.quantity }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: action.quantity }],
      }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.product.id !== action.productId),
      }
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product.id !== action.productId),
        }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      }
    }
    case "CLEAR_CART":
      return { ...state, items: [], coupon: null }
    case "SET_OPEN":
      return { ...state, isOpen: action.isOpen }
    case "LOAD_CART":
      return { ...state, items: action.items, coupon: action.coupon }
    case "APPLY_COUPON":
      return { ...state, coupon: action.coupon }
    case "REMOVE_COUPON":
      return { ...state, coupon: null }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  isOpen: boolean
  setOpen: (open: boolean) => void
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  appliedCoupon: AppliedCoupon | null
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
  discountAmount: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    coupon: null,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("stone-iwc-cart")
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as
          | CartItem[]
          | { items?: CartItem[]; coupon?: AppliedCoupon | null }

        if (Array.isArray(parsed)) {
          dispatch({ type: "LOAD_CART", items: parsed, coupon: null })
        } else {
          dispatch({
            type: "LOAD_CART",
            items: parsed.items ?? [],
            coupon: parsed.coupon ?? null,
          })
        }
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(
        "stone-iwc-cart",
        JSON.stringify({ items: state.items, coupon: state.coupon })
      )
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
    }
  }, [state.items, state.coupon])

  const setOpen = useCallback(
    (isOpen: boolean) => dispatch({ type: "SET_OPEN", isOpen }),
    []
  )

  const addItem = useCallback(
    (product: Product, quantity = 1) =>
      dispatch({ type: "ADD_ITEM", product, quantity }),
    []
  )

  const removeItem = useCallback(
    (productId: string) => dispatch({ type: "REMOVE_ITEM", productId }),
    []
  )

  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
    []
  )

  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), [])

  const applyCoupon = useCallback(
    (coupon: AppliedCoupon) => dispatch({ type: "APPLY_COUPON", coupon }),
    []
  )

  const removeCoupon = useCallback(() => dispatch({ type: "REMOVE_COUPON" }), [])

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  )
  const discountAmount = state.coupon
    ? Math.min(
        state.coupon.type === "percentage"
          ? (subtotal * state.coupon.value) / 100
          : state.coupon.value,
        subtotal
      )
    : 0
  const totalPrice = Math.max(subtotal - discountAmount, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        setOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        appliedCoupon: state.coupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
