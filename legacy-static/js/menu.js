/**
 * Velavan Catering Services - Menu Catalogue Engine
 * Supports scalable 200+ dishes, dual Veg/Non-Veg tabs, instant search,
 * category filtering (via pills & dropdown), pagination ("Load More"), and bilingual display.
 */

var menuType = "veg";
var menuPage = 1;
var menuQuery = "";
var menuCategory = "all";
const PAGE_SIZE = 8;

function getActiveMenuType() { return menuType; }
function getActiveCategory() { return menuCategory; }
function getActiveQuery() { return menuQuery; }

/**
 * Retrieve menu items from localStorage, falling back to DEFAULT_MENU_DATA
 */
function getMenuStore() {
  try {
    const saved = localStorage.getItem("velavan_menu");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.veg && parsed.nonveg) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read menu store from localStorage, using seed defaults:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_MENU_DATA));
}

/**
 * Save menu items back to localStorage
 */
function saveMenuStore(store) {
  try {
    localStorage.setItem("velavan_menu", JSON.stringify(store));
  } catch (e) {
    console.error("Failed to save menu store to localStorage:", e);
  }
}

/**
 * Get items for current food type (veg or nonveg)
 */
function getCurrentMenuItems() {
  const store = getMenuStore();
  return store[menuType] || [];
}

/**
 * Switch food type tab (Vegetarian vs Non-Vegetarian)
 */
function switchMenuType(type) {
  menuType = type;
  menuPage = 1;
  menuQuery = "";
  menuCategory = "all";

  // Reset search input
  const searchInput = document.getElementById("menuSearch");
  if (searchInput) searchInput.value = "";

  // Update tab buttons
  const vegTab = document.getElementById("vegTab");
  const nonvegTab = document.getElementById("nonvegTab");
  if (vegTab) vegTab.classList.toggle("active", type === "veg");
  if (nonvegTab) nonvegTab.classList.toggle("active", type === "nonveg");

  // Re-populate category controls for the selected type
  populateCategoryControls();

  // Render dishes
  drawMenu();
}

/**
 * Filter by Category
 */
function filterCategory(categoryKey) {
  menuCategory = categoryKey;
  menuPage = 1;

  // Sync category select dropdown
  const categorySelect = document.getElementById("menuCategory");
  if (categorySelect) categorySelect.value = categoryKey;

  // Sync category pills
  document.querySelectorAll(".category-pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.category === categoryKey);
  });

  drawMenu();
}

/**
 * Search dishes by name or description
 */
function searchMenu(query) {
  menuQuery = (query || "").toLowerCase().trim();
  menuPage = 1;
  drawMenu();
}

/**
 * Reset all active menu filters
 */
function resetMenuFilters() {
  menuQuery = "";
  menuCategory = "all";
  menuPage = 1;

  const searchInput = document.getElementById("menuSearch");
  if (searchInput) searchInput.value = "";

  const categorySelect = document.getElementById("menuCategory");
  if (categorySelect) categorySelect.value = "all";

  document.querySelectorAll(".category-pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.category === "all");
  });

  drawMenu();
}

/**
 * Load more items
 */
function loadMoreMenu() {
  menuPage++;
  drawMenu();
}

/**
 * Dynamically populate category dropdown and quick pills based on active food type
 */
function populateCategoryControls() {
  const categories = MENU_CATEGORIES[menuType] || [];
  const lang = window.currentLanguage || "en";

  // Populate Select Dropdown
  const categorySelect = document.getElementById("menuCategory");
  if (categorySelect) {
    categorySelect.innerHTML = categories.map(cat => {
      const label = lang === "ta" ? cat.labelTa : cat.labelEn;
      return `<option value="${cat.key}" ${cat.key === menuCategory ? "selected" : ""}>${label}</option>`;
    }).join("");
  }

  // Populate Horizontal Pills
  const pillsContainer = document.getElementById("categoryPills");
  if (pillsContainer) {
    pillsContainer.innerHTML = categories.map(cat => {
      const label = lang === "ta" ? cat.labelTa : cat.labelEn;
      const isActive = cat.key === menuCategory ? "active" : "";
      return `<button type="button" class="category-pill ${isActive}" data-category="${cat.key}" onclick="filterCategory('${cat.key}')">${label}</button>`;
    }).join("");
  }
}

/**
 * Render the filtered menu cards
 */
function drawMenu() {
  const items = getCurrentMenuItems();
  const lang = window.currentLanguage || "en";
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Filter items
  const filtered = items.filter(item => {
    const matchCategory = menuCategory === "all" || item.category === menuCategory;
    if (!matchCategory) return false;

    if (!menuQuery) return true;

    const haystack = [
      item.name || "",
      item.nameTa || "",
      item.desc || "",
      item.descTa || "",
      item.category || "",
      item.badge || ""
    ].join(" ").toLowerCase();

    return haystack.includes(menuQuery);
  });

  // Calculate slice
  const visible = filtered.slice(0, menuPage * PAGE_SIZE);
  const grid = document.getElementById("menuGrid");
  const countEl = document.getElementById("menuCount");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  // Render cards
  if (grid) {
    if (visible.length === 0) {
      grid.innerHTML = `
        <div class="empty" style="grid-column: 1 / -1; padding: 48px 24px;">
          <div style="font-size: 32px; color: var(--gold); margin-bottom: 12px;">✦</div>
          <p style="font-size: 14px; color: var(--muted); max-width: 440px; margin: 0 auto 18px;">
            ${t.menuEmpty}
          </p>
          <button class="btn btn-sm btn-dark" onclick="resetMenuFilters()">
            ${t.menuResetBtn}
          </button>
        </div>
      `;
    } else {
      grid.innerHTML = visible.map(item => {
        const isVeg = item.type === "veg";
        const primaryName = lang === "ta" ? (item.nameTa || item.name) : item.name;
        const secondaryName = lang === "ta" ? item.name : (item.nameTa || "");
        const description = lang === "ta" ? (item.descTa || item.desc) : item.desc;
        const categoryObj = (MENU_CATEGORIES[item.type] || []).find(c => c.key === item.category);
        const categoryLabel = categoryObj ? (lang === "ta" ? categoryObj.labelTa : categoryObj.labelEn) : (item.category || "");
        const fallbackImg = isVeg
          ? "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80"
          : "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=700&q=80";

        return `
          <article class="menu-card" data-id="${item.id}">
            <div class="menu-card-img-wrap">
              <img loading="lazy" src="${item.img || fallbackImg}" alt="${primaryName}" onerror="this.onerror=null;this.src='${fallbackImg}';">
              <span class="diet-indicator ${isVeg ? 'veg' : 'nonveg'}" title="${isVeg ? 'Vegetarian' : 'Non-Vegetarian'}"></span>
              ${item.badge ? `<span class="card-badge">${item.badge}</span>` : ""}
            </div>
            <div class="menu-card-body">
              <div class="menu-card-category">${categoryLabel}</div>
              <h3>${primaryName}</h3>
              ${secondaryName && secondaryName !== primaryName ? `<div class="tamil-sub">${secondaryName}</div>` : ""}
              <p>${description || ""}</p>
            </div>
          </article>
        `;
      }).join("");
    }
  }

  // Update dish count indicator
  if (countEl) {
    const template = t.menuShowingDishes || "Showing {visible} of {total} dishes";
    countEl.innerHTML = template.replace("{visible}", `<strong>${visible.length}</strong>`).replace("{total}", `<strong>${filtered.length}</strong>`);
  }

  // Update Load More button
  if (loadMoreBtn) {
    loadMoreBtn.style.display = visible.length < filtered.length ? "inline-flex" : "none";
    loadMoreBtn.textContent = t.menuLoadMore || "Load More Dishes";
  }
}
