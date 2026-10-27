/**
 * MINH CARDS - UI dùng chung cho toàn bộ website
 * Header, Footer, Toast notifications, Off-canvas Humberger, Badges
 */

// Toast notification tự tắt sau 3 giây
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = `
      position: fixed;
      top: 25px;
      right: 25px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `custom-toast toast-${type}`;
  toast.style.cssText = `
    min-width: 280px;
    max-width: 380px;
    background: #fff;
    color: #333;
    padding: 14px 18px;
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    border-left: 5px solid #7fad39;
    transform: translateX(120%);
    opacity: 0;
    transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
    pointer-events: auto;
  `;

  let iconHtml = '<i class="fa fa-check-circle" style="color: #7fad39; font-size: 20px;"></i>';
  if (type === "error") {
    toast.style.borderLeftColor = "#e53935";
    iconHtml = '<i class="fa fa-times-circle" style="color: #e53935; font-size: 20px;"></i>';
  } else if (type === "warning") {
    toast.style.borderLeftColor = "#f39c12";
    iconHtml = '<i class="fa fa-exclamation-triangle" style="color: #f39c12; font-size: 20px;"></i>';
  } else if (type === "info") {
    toast.style.borderLeftColor = "#3498db";
    iconHtml = '<i class="fa fa-info-circle" style="color: #3498db; font-size: 20px;"></i>';
  }

  toast.innerHTML = `
    ${iconHtml}
    <div style="flex: 1;">${message}</div>
    <span style="cursor: pointer; color: #999; font-size: 16px; margin-left: 8px;" onclick="this.parentElement.remove()">&times;</span>
  `;

  container.appendChild(toast);

  // Trigger animation slide in
  requestAnimationFrame(() => {
    toast.style.transform = "translateX(0)";
    toast.style.opacity = "1";
  });

  // Tự tắt sau 3 giây
  setTimeout(() => {
    toast.style.transform = "translateX(120%)";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 400);
  }, 3000);
}

// Cập nhật badge giỏ hàng và tổng tiền trên Header
function updateHeaderCartBadge() {
  const totals = typeof getCartTotals === "function" ? getCartTotals() : { totalItems: 0, finalTotal: 0 };
  const badgeElements = document.querySelectorAll(".header-cart-count");
  badgeElements.forEach(el => {
    el.textContent = totals.totalItems;
  });

  const priceElements = document.querySelectorAll(".header-cart-price-total");
  priceElements.forEach(el => {
    el.textContent = typeof formatVND === "function" ? formatVND(totals.finalTotal) : totals.finalTotal + "đ";
  });
}

// Cập nhật badge yêu thích trên Header
function updateHeaderWishlistBadge() {
  const list = typeof getWishlist === "function" ? getWishlist() : [];
  const badgeElements = document.querySelectorAll(".header-wishlist-count");
  badgeElements.forEach(el => {
    el.textContent = list.length;
  });
}

// Cập nhật trạng thái người dùng trên Header (Desktop & Mobile)
function updateHeaderAuth() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  const authContainers = document.querySelectorAll(".header__top__right__auth, .humberger__menu__widget .header__top__right__auth");

  authContainers.forEach(container => {
    if (user) {
      container.innerHTML = `
        <div class="user-dropdown" style="display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;">
          <a href="orders.html" style="color: #252525; font-size: 13px; font-weight: 700;">
            <i class="fa fa-user-circle" style="color: #7fad39; margin-right: 4px;"></i> Xin chào, ${user.name}
          </a>
          <a href="orders.html" style="font-size: 12px; color: #4a5568;" title="Đơn hàng của bạn">[Đơn hàng]</a>
          <a href="javascript:void(0)" onclick="logoutUser()" style="font-size: 12px; color: #ee1515;" title="Đăng xuất">[Thoát]</a>
        </div>
      `;
    } else {
      container.innerHTML = `
        <a href="login.html" style="white-space: nowrap;"><i class="fa fa-user"></i> Đăng nhập</a>
        <span style="color: #cbd5e1; font-weight: bold; margin: 0 4px;">/</span>
        <a href="register.html" style="white-space: nowrap;">Đăng ký</a>
      `;
    }
  });
}

// Khởi tạo các sự kiện toàn cục khi trang tải xong
document.addEventListener("DOMContentLoaded", function() {
  // Cập nhật badges và auth
  updateHeaderCartBadge();
  updateHeaderWishlistBadge();
  updateHeaderAuth();

  // Humberger Mobile Menu toggle
  const humbergerOpen = document.querySelector(".humberger__open");
  const humbergerMenuWrapper = document.querySelector(".humberger__menu__wrapper");
  const humbergerMenuOverlay = document.querySelector(".humberger__menu__overlay");

  if (humbergerOpen && humbergerMenuWrapper && humbergerMenuOverlay) {
    humbergerOpen.addEventListener("click", function() {
      humbergerMenuWrapper.classList.add("show__humberger__menu__wrapper");
      humbergerMenuOverlay.classList.add("active");
      document.body.classList.add("over_hid");
    });

    humbergerMenuOverlay.addEventListener("click", function() {
      humbergerMenuWrapper.classList.remove("show__humberger__menu__wrapper");
      humbergerMenuOverlay.classList.remove("active");
      document.body.classList.remove("over_hid");
    });
  }

  // Categories Sidebar Toggle trong Hero Section
  const heroCatAll = document.querySelector(".hero__categories__all");
  const heroCatUl = document.querySelector(".hero__categories ul");
  if (heroCatAll && heroCatUl) {
    heroCatAll.addEventListener("click", function(e) {
      e.preventDefault();
      if (heroCatUl.style.display === "none" || heroCatUl.classList.contains("closed")) {
        heroCatUl.style.display = "block";
        heroCatUl.classList.remove("closed");
      } else {
        heroCatUl.style.display = "none";
        heroCatUl.classList.add("closed");
      }
    });
  }

  // Lắng nghe sự kiện thêm vào giỏ hàng từ nút `.add-to-cart-btn`
  document.addEventListener("click", function(e) {
    const addBtn = e.target.closest(".add-to-cart-btn");
    if (addBtn) {
      e.preventDefault();
      const pid = addBtn.getAttribute("data-id");
      const qtyInput = document.getElementById("product-detail-qty");
      const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
      if (typeof addToCart === "function") {
        addToCart(pid, qty);
      }
    }

    // Lắng nghe sự kiện click wishlist `.wishlist-btn`
    const wishBtn = e.target.closest(".wishlist-btn");
    if (wishBtn) {
      e.preventDefault();
      const pid = wishBtn.getAttribute("data-id");
      if (typeof toggleWishlist === "function") {
        toggleWishlist(pid);
      }
    }
  });

  // Background image loader (Ogani set-bg helper)
  document.querySelectorAll(".set-bg").forEach(function(el) {
    const bg = el.getAttribute("data-setbg");
    if (bg) {
      el.style.backgroundImage = `url("${bg}")`;
    }
  });
});
