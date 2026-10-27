/**
 * MINH CARDS - Logic Hiển thị và Bộ lọc Sản phẩm
 * Tìm kiếm không dấu, lọc độ hiếm, khoảng giá, sắp xếp, phân trang, chi tiết sản phẩm
 */

// Hàm loại bỏ dấu tiếng Việt để tìm kiếm thông minh
function removeVietnameseTones(str) {
  if (!str) return "";
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  str = str.replace(/\u02C6|\u0306|\u031B/g, "");
  return str.trim();
}

// Render HTML cho 1 item thẻ bài theo đúng chuẩn Ogani product__item
function renderProductCard(p, colClass = "col-lg-4 col-md-6 col-sm-6") {
  const isWished = typeof isInWishlist === "function" && isInWishlist(p.id);
  const heartClass = isWished ? "fa fa-heart" : "fa fa-heart-o";
  const heartStyle = isWished ? "color: #ee1515;" : "";

  // Badge độ hiếm
  let rarityBadgeColor = "#7fad39";
  if (p.rarity === "Secret Rare") rarityBadgeColor = "#e3350d";
  else if (p.rarity === "Ultra Rare") rarityBadgeColor = "#e67e22";
  else if (p.rarity === "Rare") rarityBadgeColor = "#3498db";

  const genSlug = (p.generation || "gen1").toLowerCase().replace(/\s+/g, '');

  return `
    <div class="${colClass} mix rarity-${p.rarity.toLowerCase().replace(/\s+/g, '-')} gen-${genSlug}">
      <div class="product__item" data-id="${p.id}">
        <div class="product__item__pic set-bg" data-setbg="${p.image}" style="background-image: url('${p.image}'); background-size: contain; background-repeat: no-repeat; background-position: center; background-color: #f7f9fa; border: 1px solid #eee; border-radius: 6px;">
          <span class="rarity-badge" style="position: absolute; top: 10px; left: 10px; background: ${rarityBadgeColor}; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 12px; text-transform: uppercase;">${p.rarity}</span>
          <span class="gen-badge" style="position: absolute; top: 10px; right: 10px; background: #2b394a; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 12px;">${p.generation || 'Gen 1'}</span>
          <ul class="product__item__pic__hover">
            <li><a href="javascript:void(0)" class="wishlist-btn ${isWished ? 'active' : ''}" data-id="${p.id}" title="Yêu thích"><i class="${heartClass}" style="${heartStyle}"></i></a></li>
            <li><a href="shop-details.html?id=${p.id}" title="Xem chi tiết"><i class="fa fa-retweet"></i></a></li>
            <li><a href="javascript:void(0)" class="add-to-cart-btn" data-id="${p.id}" title="Thêm giỏ hàng"><i class="fa fa-shopping-cart"></i></a></li>
          </ul>
        </div>
        <div class="product__item__text" style="padding-top: 15px;">
          <span style="font-size: 11px; color: #7fad39; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">${p.genName || p.generation} &bull; ${p.set}</span>
          <h6><a href="shop-details.html?id=${p.id}" style="font-weight: 700; color: #1c1c1c; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</a></h6>
          <div class="product__price" style="font-size: 16px; font-weight: 700; color: #ee1515;">
            ${formatVND(p.price)}
            ${p.originalPrice ? `<span style="font-size: 13px; color: #b2b2b2; text-decoration: line-through; margin-left: 8px; font-weight: 400;">${formatVND(p.originalPrice)}</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Lọc và sắp xếp danh sách sản phẩm
function filterProducts(options = {}) {
  let list = typeof getProducts === "function" ? getProducts() : [];

  // Lọc theo từ khoá tìm kiếm
  if (options.keyword && options.keyword.trim() !== "") {
    const kw = removeVietnameseTones(options.keyword.trim());
    list = list.filter(p => {
      const name = removeVietnameseTones(p.name);
      const set = removeVietnameseTones(p.set || "");
      const desc = removeVietnameseTones(p.description || "");
      const rarity = removeVietnameseTones(p.rarity || "");
      const gen = removeVietnameseTones(p.generation || "");
      const genName = removeVietnameseTones(p.genName || "");
      return name.includes(kw) || set.includes(kw) || desc.includes(kw) || rarity.includes(kw) || gen.includes(kw) || genName.includes(kw);
    });
  }

  // Lọc theo thế hệ (Generation)
  if (options.generation && options.generation !== "all") {
    list = list.filter(p => (p.generation || "").toLowerCase() === options.generation.toLowerCase());
  }

  // Lọc theo độ hiếm
  if (options.rarity && options.rarity !== "all") {
    list = list.filter(p => p.rarity.toLowerCase() === options.rarity.toLowerCase());
  }

  // Lọc theo bộ thẻ (Set)
  if (options.set && options.set !== "all") {
    list = list.filter(p => (p.set || "").toLowerCase() === options.set.toLowerCase());
  }

  // Lọc theo khoảng giá
  if (typeof options.minPrice === "number" && !isNaN(options.minPrice)) {
    list = list.filter(p => p.price >= options.minPrice);
  }
  if (typeof options.maxPrice === "number" && !isNaN(options.maxPrice) && options.maxPrice > 0) {
    list = list.filter(p => p.price <= options.maxPrice);
  }

  // Sắp xếp
  if (options.sortBy) {
    switch (options.sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "popular":
        list.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      default:
        break;
    }
  }

  return list;
}
