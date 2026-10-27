/**
 * MINH CARDS - Quản lý Giỏ hàng (Cart)
 * Thêm, sửa số lượng, xoá, áp mã giảm giá, lưu trữ localStorage
 */

const STORAGE_CART = "pokecard_cart";
const STORAGE_COUPON = "pokecard_applied_coupon";

// Danh sách mã coupon hợp lệ
const VALID_COUPONS = {
  "POKE10": { code: "POKE10", discountPercent: 10, desc: "Giảm 10% tổng đơn hàng" },
  "PIKACHU": { code: "PIKACHU", discountPercent: 20, desc: "Giảm 20% thẻ bài Pikachu tri ân" },
  "FREESHIP": { code: "FREESHIP", discountPercent: 5, desc: "Hỗ trợ 5% phí vận chuyển" }
};

// Lấy danh sách sản phẩm trong giỏ hàng
function getCart() {
  const data = localStorage.getItem(STORAGE_CART);
  return data ? JSON.parse(data) : [];
}

// Lưu giỏ hàng
function saveCart(cart) {
  localStorage.setItem(STORAGE_CART, JSON.stringify(cart));
  if (typeof updateHeaderCartBadge === "function") {
    updateHeaderCartBadge();
  }
}

// Lấy coupon hiện tại
function getAppliedCoupon() {
  const code = localStorage.getItem(STORAGE_COUPON);
  return code && VALID_COUPONS[code] ? VALID_COUPONS[code] : null;
}

// Áp dụng coupon
function applyCoupon(couponCode) {
  const cleanCode = (couponCode || "").trim().toUpperCase();
  if (VALID_COUPONS[cleanCode]) {
    localStorage.setItem(STORAGE_COUPON, cleanCode);
    return { success: true, coupon: VALID_COUPONS[cleanCode] };
  }
  return { success: false, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn!" };
}

// Xoá coupon
function removeCoupon() {
  localStorage.removeItem(STORAGE_COUPON);
}

// Thêm thẻ bài vào giỏ hàng
function addToCart(productId, quantity = 1) {
  productId = Number(productId);
  quantity = parseInt(quantity, 10);
  if (isNaN(quantity) || quantity < 1) quantity = 1;

  const product = typeof getProductById === "function" ? getProductById(productId) : null;
  if (!product) {
    if (typeof showToast === "function") showToast("Sản phẩm không tồn tại!", "error");
    return false;
  }

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === productId);

  let currentQtyInCart = 0;
  if (existingIndex > -1) {
    currentQtyInCart = cart[existingIndex].quantity;
  }

  const maxStock = product.stock || 99;
  if (currentQtyInCart + quantity > maxStock) {
    const canAdd = maxStock - currentQtyInCart;
    if (canAdd <= 0) {
      if (typeof showToast === "function") {
        showToast(`Thẻ bài "${product.name}" đã đạt số lượng tối đa trong kho (${maxStock})!`, "warning");
      }
      return false;
    }
    quantity = canAdd;
  }

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      rarity: product.rarity,
      quantity: quantity,
      stock: maxStock
    });
  }

  saveCart(cart);

  if (typeof showToast === "function") {
    showToast(`Đã thêm ${quantity} thẻ "${product.name}" vào giỏ hàng!`, "success");
  }

  // Phát âm thanh nhẹ nếu có file âm thanh
  playCardSound();

  return true;
}

// Cập nhật số lượng sản phẩm trong giỏ
function updateCartQuantity(productId, quantity) {
  productId = Number(productId);
  quantity = parseInt(quantity, 10);

  const cart = getCart();
  const index = cart.findIndex(item => item.id === productId);
  if (index === -1) return false;

  const product = typeof getProductById === "function" ? getProductById(productId) : null;
  const maxStock = product ? product.stock : (cart[index].stock || 99);

  if (quantity < 1) {
    quantity = 1;
  } else if (quantity > maxStock) {
    quantity = maxStock;
    if (typeof showToast === "function") {
      showToast(`Số lượng thẻ tối đa có thể mua là ${maxStock}`, "warning");
    }
  }

  cart[index].quantity = quantity;
  saveCart(cart);
  return true;
}

// Xoá sản phẩm khỏi giỏ
function removeFromCart(productId) {
  productId = Number(productId);
  let cart = getCart();
  const product = cart.find(item => item.id === productId);
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);

  if (typeof showToast === "function" && product) {
    showToast(`Đã xoá "${product.name}" khỏi giỏ hàng.`, "info");
  }
}

// Xoá toàn bộ giỏ hàng
function clearCart() {
  localStorage.removeItem(STORAGE_CART);
  removeCoupon();
  if (typeof updateHeaderCartBadge === "function") {
    updateHeaderCartBadge();
  }
}

// Tính toán tổng tiền giỏ hàng
function getCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const coupon = getAppliedCoupon();
  let discountAmount = 0;
  if (coupon && subtotal > 0) {
    discountAmount = Math.round((subtotal * coupon.discountPercent) / 100);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return {
    cart,
    totalItems,
    subtotal,
    coupon,
    discountAmount,
    finalTotal
  };
}

// Âm thanh thêm giỏ hàng (nếu có)
function playCardSound() {
  try {
    const audio = new Audio("Sounds/add-cart.mp3");
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch (e) {}
}
