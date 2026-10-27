/**
 * MINH CARDS - Quản lý Đơn hàng (Checkout, Lịch sử đơn, Huỷ đơn)
 * Lưu trữ trong localStorage theo tài khoản
 */

const STORAGE_ORDERS = "pokecard_orders";

// Lấy danh sách đơn hàng
function getAllOrders() {
  const data = localStorage.getItem(STORAGE_ORDERS);
  return data ? JSON.parse(data) : [];
}

// Lưu danh sách đơn hàng
function saveOrders(orders) {
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
}

// Lấy danh sách đơn của user hiện tại
function getUserOrders() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  const all = getAllOrders();
  if (!user) return [];
  // Lọc theo userId hoặc user email
  return all
    .filter(o => o.userId === user.id || (user.email && o.customerEmail === user.email))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Tạo đơn hàng mới
function createOrder(orderData) {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (!user) {
    return { success: false, message: "Vui lòng đăng nhập để hoàn tất đơn hàng!" };
  }

  const totals = typeof getCartTotals === "function" ? getCartTotals() : { cart: [], finalTotal: 0 };
  if (!totals.cart || totals.cart.length === 0) {
    return { success: false, message: "Giỏ hàng của bạn đang trống!" };
  }

  // Validate form checkout
  const errors = {};
  if (!orderData.fullName || !orderData.fullName.trim()) errors.fullName = "Vui lòng nhập họ và tên nhận hàng.";
  if (!orderData.phone || !orderData.phone.trim()) {
    errors.phone = "Vui lòng nhập số điện thoại.";
  } else if (!/^[0-9+]{9,13}$/.test(orderData.phone.trim())) {
    errors.phone = "Số điện thoại không hợp lệ (9 - 13 chữ số).";
  }
  if (!orderData.address || !orderData.address.trim()) errors.address = "Vui lòng nhập địa chỉ giao hàng cụ thể.";
  if (!orderData.paymentMethod) errors.paymentMethod = "Vui lòng chọn phương thức thanh toán.";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    id: orderId,
    userId: user.id,
    customerName: orderData.fullName.trim(),
    customerEmail: user.email,
    customerPhone: orderData.phone.trim(),
    customerAddress: orderData.address.trim(),
    customerNote: (orderData.note || "").trim(),
    paymentMethod: orderData.paymentMethod, // "COD" hoặc "BANK"
    paymentStatus: orderData.paymentMethod === "COD" ? "Chưa thanh toán (COD)" : "Đã chuyển khoản mô phỏng",
    items: totals.cart.map(item => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    })),
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount || 0,
    couponCode: totals.coupon ? totals.coupon.code : null,
    total: totals.finalTotal,
    status: "Chờ xử lý", // "Chờ xử lý" | "Đang giao" | "Đã giao" | "Đã hủy"
    createdAt: new Date().toISOString()
  };

  const allOrders = getAllOrders();
  allOrders.unshift(newOrder);
  saveOrders(allOrders);

  // Xoá giỏ sau khi đặt hàng thành công
  if (typeof clearCart === "function") {
    clearCart();
  }

  return { success: true, order: newOrder };
}

// Huỷ đơn hàng (Chỉ cho phép khi trạng thái "Chờ xử lý")
function cancelOrder(orderId) {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (!user) return { success: false, message: "Vui lòng đăng nhập!" };

  const allOrders = getAllOrders();
  const order = allOrders.find(o => o.id === orderId && (o.userId === user.id || o.customerEmail === user.email));

  if (!order) {
    return { success: false, message: "Không tìm thấy đơn hàng!" };
  }

  if (order.status !== "Chờ xử lý") {
    return { success: false, message: `Không thể huỷ đơn hàng ở trạng thái "${order.status}".` };
  }

  order.status = "Đã hủy";
  order.cancelledAt = new Date().toISOString();
  saveOrders(allOrders);

  if (typeof showToast === "function") {
    showToast(`Đơn hàng #${orderId} đã được huỷ thành công.`, "info");
  }

  return { success: true, order };
}
