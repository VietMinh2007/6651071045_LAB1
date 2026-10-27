/**
 * MINH CARDS - Quản lý Danh sách Yêu thích (Wishlist)
 * Lưu theo tài khoản hoặc session khách trong localStorage
 */

const STORAGE_WISHLIST = "pokecard_wishlist";

// Lấy danh sách wishlist ID
function getWishlist() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  const key = user ? `${STORAGE_WISHLIST}_${user.id}` : `${STORAGE_WISHLIST}_guest`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Lưu danh sách wishlist ID
function saveWishlist(list) {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  const key = user ? `${STORAGE_WISHLIST}_${user.id}` : `${STORAGE_WISHLIST}_guest`;
  localStorage.setItem(key, JSON.stringify(list));
  if (typeof updateHeaderWishlistBadge === "function") {
    updateHeaderWishlistBadge();
  }
}

// Kiểm tra sản phẩm có trong wishlist không
function isInWishlist(productId) {
  productId = Number(productId);
  const list = getWishlist();
  return list.includes(productId);
}

// Chuyển đổi trạng thái yêu thích (Toggle)
function toggleWishlist(productId) {
  productId = Number(productId);
  let list = getWishlist();
  const product = typeof getProductById === "function" ? getProductById(productId) : null;
  const name = product ? product.name : "Thẻ bài";

  const index = list.indexOf(productId);
  let isAdded = false;

  if (index > -1) {
    list.splice(index, 1);
    if (typeof showToast === "function") {
      showToast(`Đã bỏ "${name}" khỏi danh sách yêu thích.`, "info");
    }
  } else {
    list.push(productId);
    isAdded = true;
    if (typeof showToast === "function") {
      showToast(`Đã thêm "${name}" vào danh sách yêu thích!`, "success");
    }
  }

  saveWishlist(list);

  // Cập nhật giao diện nút trái tim nếu đang có trên trang
  document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`).forEach(btn => {
    if (isAdded) {
      btn.classList.add("active");
      const icon = btn.querySelector("i");
      if (icon) {
        icon.className = "fa fa-heart";
        icon.style.color = "#ee1515";
      }
    } else {
      btn.classList.remove("active");
      const icon = btn.querySelector("i");
      if (icon) {
        icon.className = "fa fa-heart-o";
        icon.style.color = "";
      }
    }
  });

  return isAdded;
}

// Xoá sản phẩm khỏi wishlist
function removeFromWishlist(productId) {
  productId = Number(productId);
  let list = getWishlist();
  list = list.filter(id => id !== productId);
  saveWishlist(list);
  if (typeof showToast === "function") {
    showToast("Đã xoá thẻ khỏi danh sách yêu thích.", "info");
  }
}
