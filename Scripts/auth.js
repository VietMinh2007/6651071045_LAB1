/**
 * MINH CARDS - Quản lý Tài khoản (Đăng ký, Đăng nhập, Đăng xuất)
 * Lưu trữ bằng localStorage, mật khẩu btoa mô phỏng học tập
 */

const STORAGE_USERS = "pokecard_users";
const STORAGE_CURRENT_USER = "pokecard_current_user";

// Lấy danh sách users từ localStorage
function getUsers() {
  const users = localStorage.getItem(STORAGE_USERS);
  return users ? JSON.parse(users) : [];
}

// Lưu danh sách users
function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

// Lấy user đang đăng nhập
function getCurrentUser() {
  const user = localStorage.getItem(STORAGE_CURRENT_USER);
  return user ? JSON.parse(user) : null;
}

// Lưu session user đăng nhập
function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER);
  }
}

// Đăng ký tài khoản mới
function registerUser(name, email, password, confirmPassword) {
  name = (name || "").trim();
  email = (email || "").trim().toLowerCase();
  password = (password || "").trim();
  confirmPassword = (confirmPassword || "").trim();

  const errors = {};

  if (!name) {
    errors.name = "Vui lòng nhập họ và tên của bạn.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = "Vui lòng nhập địa chỉ email.";
  } else if (!emailRegex.test(email)) {
    errors.email = "Email không đúng định dạng (VD: example@domain.com).";
  }

  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  } else if (password.length < 6) {
    errors.password = "Mật khẩu phải chứa ít nhất 6 ký tự.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không trùng khớp.";
  }

  const users = getUsers();
  if (email && users.some(u => u.email.toLowerCase() === email)) {
    errors.email = "Email này đã được đăng ký tài khoản.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Mã hoá mô phỏng bằng btoa (chỉ phục vụ mục đích học tập)
  const encodedPassword = btoa(unescape(encodeURIComponent(password)));
  const newUser = {
    id: "USR-" + Date.now(),
    name,
    email,
    password: encodedPassword,
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // Tự động đăng nhập sau khi đăng ký thành công
  const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email };
  setCurrentUser(sessionUser);

  return { success: true, user: sessionUser };
}

// Đăng nhập tài khoản
function loginUser(email, password) {
  email = (email || "").trim().toLowerCase();
  password = (password || "").trim();

  const errors = {};
  if (!email) {
    errors.email = "Vui lòng nhập địa chỉ email.";
  }
  if (!password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const users = getUsers();
  const encodedPassword = btoa(unescape(encodeURIComponent(password)));
  const user = users.find(u => u.email.toLowerCase() === email && u.password === encodedPassword);

  if (!user) {
    return {
      success: false,
      errors: { general: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại." }
    };
  }

  const sessionUser = { id: user.id, name: user.name, email: user.email };
  setCurrentUser(sessionUser);

  return { success: true, user: sessionUser };
}

// Đăng xuất
function logoutUser() {
  setCurrentUser(null);
  if (typeof showToast === "function") {
    showToast("Đã đăng xuất thành công!", "info");
  }
  setTimeout(() => {
    window.location.reload();
  }, 400);
}

// Kiểm tra quyền truy cập yêu cầu đăng nhập
function requireAuth(redirectUrl = "checkout.html") {
  const user = getCurrentUser();
  if (!user) {
    if (typeof showToast === "function") {
      showToast("Vui lòng đăng nhập để tiếp tục!", "warning");
    }
    setTimeout(() => {
      window.location.href = `login.html?redirect=${encodeURIComponent(redirectUrl)}`;
    }, 600);
    return false;
  }
  return true;
}
