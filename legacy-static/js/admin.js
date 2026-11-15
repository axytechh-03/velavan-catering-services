/**
 * Velavan Catering Services - Admin Management Dashboard
 * Client Demonstration Mode (localStorage-backed)
 * Features:
 * - Overview KPI statistics (Total, New, Veg dishes, Non-Veg dishes, Confirmed)
 * - Full Menu CRUD (Add, Edit, Delete for both Veg and Non-Veg)
 * - Enquiry Management (Filter by status, view complete details, update status, delete)
 * - Gallery Management (Add new photo URL + caption, delete photo)
 * - Business Settings & WhatsApp number configuration
 * - Demo Data Reset button
 */

let activeAdminTab = "overview";
let editingDishId = null;
let editingDishType = null;
let enquiryStatusFilter = "all";
let enquirySearchQuery = "";
let adminMenuTypeFilter = "all";
let adminMenuSearchQuery = "";

/**
 * Open the Admin Dashboard Modal
 */
function openAdmin() {
  const modal = document.getElementById("adminModal");
  if (modal) {
    modal.classList.add("open");
    renderAdminContent(activeAdminTab);
  }
}

/**
 * Close the Admin Dashboard Modal
 */
function closeAdmin() {
  const modal = document.getElementById("adminModal");
  if (modal) {
    modal.classList.remove("open");
  }
}

/**
 * Switch Admin Tabs
 */
function switchAdminTab(tabName, buttonEl) {
  activeAdminTab = tabName;
  document.querySelectorAll(".admin-tab").forEach(tab => tab.classList.remove("active"));
  if (buttonEl) {
    buttonEl.classList.add("active");
  } else {
    const matchingBtn = document.querySelector(`.admin-tab[data-tab="${tabName}"]`);
    if (matchingBtn) matchingBtn.classList.add("active");
  }
  renderAdminContent(tabName);
}

/**
 * Render Admin Content based on tab
 */
function renderAdminContent(tab) {
  const container = document.getElementById("adminContent");
  if (!container) return;

  if (tab === "overview") renderAdminOverview(container);
  else if (tab === "enquiries") renderAdminEnquiries(container);
  else if (tab === "menus") renderAdminMenus(container);
  else if (tab === "gallery") renderAdminGallery(container);
  else if (tab === "settings") renderAdminSettings(container);
}

/* ==========================================================================
   1. OVERVIEW TAB
   ========================================================================== */
function renderAdminOverview(container) {
  const enquiries = getStoredEnquiries();
  const menuStore = getMenuStore();
  const vegCount = (menuStore.veg || []).length;
  const nonvegCount = (menuStore.nonveg || []).length;
  const totalMenu = vegCount + nonvegCount;
  const newEnquiries = enquiries.filter(e => e.status === "New").length;
  const confirmedEnquiries = enquiries.filter(e => e.status === "Confirmed").length;
  const galleryItems = getStoredGallery();

  container.innerHTML = `
    <div class="admin-stats">
      <div class="stat">
        <small>Total Enquiries</small>
        <strong>${enquiries.length}</strong>
      </div>
      <div class="stat" style="border-left-color: #0b63b8;">
        <small>New Enquiries</small>
        <strong style="color: #0b63b8;">${newEnquiries}</strong>
      </div>
      <div class="stat" style="border-left-color: #155724;">
        <small>Confirmed Events</small>
        <strong style="color: #155724;">${confirmedEnquiries}</strong>
      </div>
      <div class="stat" style="border-left-color: var(--veg-color);">
        <small>Vegetarian Dishes</small>
        <strong style="color: var(--veg-color);">${vegCount}</strong>
      </div>
      <div class="stat" style="border-left-color: var(--nonveg-color);">
        <small>Non-Veg Dishes</small>
        <strong style="color: var(--nonveg-color);">${nonvegCount}</strong>
      </div>
    </div>

    <div style="background: #ffffff; border: 1px solid var(--line); border-radius: 4px; padding: 24px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap;">
        <div>
          <span style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold-dark); font-weight: 700;">
            MANAGEMENT WORKSPACE
          </span>
          <h3 style="font: 500 28px 'Cormorant Garamond', Georgia, serif; color: var(--green); margin: 6px 0 10px;">
            Velavan Catering Business Console
          </h3>
          <p style="font-size: 13px; color: var(--muted); margin: 0; max-width: 620px; line-height: 1.7;">
            Welcome to the interactive prototype management panel. You can test submitting public enquiries, managing the scalable 200+ dish catalogue, organizing gallery photos, and updating demonstration contact details.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-sm btn-dark" onclick="switchAdminTab('menus')">
            + Add New Dish
          </button>
          <button class="btn btn-sm" onclick="switchAdminTab('enquiries')">
            View Enquiries (${newEnquiries})
          </button>
          <button class="btn btn-sm btn-outline" style="color: var(--green); border-color: var(--line);" onclick="resetAllDemoData()">
            ↻ Reset Demo Data
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Enquiries Snippet -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="font: 500 22px 'Cormorant Garamond', Georgia, serif; color: var(--green2); margin: 0;">
          Recent Catering Enquiries
        </h4>
        <button class="btn btn-sm btn-outline" style="color: var(--green); border-color: var(--line); font-size: 9px;" onclick="switchAdminTab('enquiries')">
          View All Enquiries →
        </button>
      </div>
      ${renderEnquiryTable(enquiries.slice(0, 3), true)}
    </div>

    <div class="admin-note">
      <strong>Demonstration Mode Architecture:</strong> All changes made here (new dishes, edited descriptions, status updates, new gallery items) are retained in this browser using modern HTML5 <code>localStorage</code>. For commercial production launch, AXY Technologies will connect this interface to secure JWT/OAuth authentication, server-side REST APIs, PostgreSQL/MongoDB, and S3/Cloudflare media storage.
    </div>
  `;
}

/* ==========================================================================
   2. ENQUIRY MANAGEMENT TAB
   ========================================================================== */
function getStoredEnquiries() {
  try {
    const raw = localStorage.getItem("velavan_enquiries");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read enquiries:", e);
  }
  // Initialize with seed enquiries
  const clone = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_ENQUIRIES));
  localStorage.setItem("velavan_enquiries", JSON.stringify(clone));
  return clone;
}

function saveStoredEnquiries(enquiries) {
  try {
    localStorage.setItem("velavan_enquiries", JSON.stringify(enquiries));
  } catch (e) {
    console.error("Failed to save enquiries:", e);
  }
}

function renderAdminEnquiries(container) {
  const enquiries = getStoredEnquiries();

  // Filter by status and search
  const filtered = enquiries.filter(item => {
    const matchStatus = enquiryStatusFilter === "all" || item.status === enquiryStatusFilter;
    if (!matchStatus) return false;
    if (!enquirySearchQuery) return true;
    const haystack = [item.name, item.phone, item.email, item.event, item.location, item.notes].join(" ").toLowerCase();
    return haystack.includes(enquirySearchQuery);
  });

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 18px;">
      <div style="display: flex; gap: 10px; align-items: center; flex: 1; min-width: 280px;">
        <input
          type="search"
          placeholder="Search by customer name, phone or venue..."
          value="${escapeHtml(enquirySearchQuery)}"
          oninput="enquirySearchQuery = this.value.toLowerCase().trim(); renderAdminEnquiries(document.getElementById('adminContent'));"
          style="flex: 1; padding: 10px 14px; border: 1px solid var(--line); border-radius: 3px; font-size: 12px;"
        />
        <select
          onchange="enquiryStatusFilter = this.value; renderAdminEnquiries(document.getElementById('adminContent'));"
          style="padding: 10px 12px; border: 1px solid var(--line); border-radius: 3px; font-size: 12px; background: #fff;"
        >
          <option value="all" ${enquiryStatusFilter === 'all' ? 'selected' : ''}>All Statuses (${enquiries.length})</option>
          <option value="New" ${enquiryStatusFilter === 'New' ? 'selected' : ''}>New (${enquiries.filter(e => e.status === 'New').length})</option>
          <option value="Contacted" ${enquiryStatusFilter === 'Contacted' ? 'selected' : ''}>Contacted (${enquiries.filter(e => e.status === 'Contacted').length})</option>
          <option value="Confirmed" ${enquiryStatusFilter === 'Confirmed' ? 'selected' : ''}>Confirmed (${enquiries.filter(e => e.status === 'Confirmed').length})</option>
        </select>
      </div>
      <div>
        <span style="font-size: 11px; color: var(--muted);">
          Showing <strong>${filtered.length}</strong> of <strong>${enquiries.length}</strong> enquiries
        </span>
      </div>
    </div>

    ${renderEnquiryTable(filtered, false)}
  `;
}

function renderEnquiryTable(enquiries, isCompact) {
  if (!enquiries || enquiries.length === 0) {
    return `
      <div class="empty">
        <p>No enquiries found matching your filter.</p>
      </div>
    `;
  }

  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Event Details</th>
            <th>Date & Guests</th>
            <th>Food Preference</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${enquiries.map(enq => `
            <tr>
              <td>
                <strong style="color: var(--green); font-size: 13px;">${escapeHtml(enq.name)}</strong>
                <div style="color: var(--muted); font-size: 11px; margin-top: 3px;">
                  📞 <a href="tel:${escapeHtml(enq.phone)}" style="color: inherit; text-decoration: underline;">${escapeHtml(enq.phone)}</a>
                </div>
                ${enq.email ? `<div style="color: var(--muted); font-size: 10.5px;">✉ ${escapeHtml(enq.email)}</div>` : ""}
              </td>
              <td>
                <span style="font-weight: 600; color: var(--ink);">${escapeHtml(enq.event)}</span>
                <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">
                  📍 ${escapeHtml(enq.location || "Venue to be confirmed")}
                </div>
              </td>
              <td>
                <div>📅 <strong>${escapeHtml(enq.date || "Not set")}</strong></div>
                <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">
                  👥 ${escapeHtml(String(enq.guests || "—"))} guests
                </div>
              </td>
              <td>
                <span class="diet-indicator ${enq.food === 'Vegetarian' ? 'veg' : (enq.food === 'Non-Vegetarian' ? 'nonveg' : '')}" style="display: inline-block; vertical-align: middle; margin-right: 5px; width: 14px; height: 14px;"></span>
                <span>${escapeHtml(enq.food || "Both")}</span>
              </td>
              <td>
                <select
                  onchange="updateEnquiryStatus(${enq.id}, this.value)"
                  style="border: 1px solid var(--line); padding: 5px 8px; font-size: 11px; border-radius: 2px; font-weight: 600; background: #fff;"
                >
                  <option value="New" ${enq.status === 'New' ? 'selected' : ''}>New</option>
                  <option value="Contacted" ${enq.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                  <option value="Confirmed" ${enq.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                </select>
              </td>
              <td style="text-align: right;">
                <div class="admin-actions" style="justify-content: flex-end;">
                  <button class="btn-action-edit" onclick="viewEnquiryDetails(${enq.id})">
                    View
                  </button>
                  <button class="btn-action-del" onclick="deleteEnquiryRecord(${enq.id})">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function updateEnquiryStatus(id, newStatus) {
  const enquiries = getStoredEnquiries().map(item => {
    if (item.id === id) {
      return { ...item, status: newStatus };
    }
    return item;
  });
  saveStoredEnquiries(enquiries);
  safeToast(`Enquiry status updated to "${newStatus}".`);
  if (activeAdminTab === "enquiries" || activeAdminTab === "overview") {
    renderAdminContent(activeAdminTab);
  }
}

function deleteEnquiryRecord(id) {
  if (!confirm("Are you sure you want to delete this enquiry from the prototype database?")) return;
  const filtered = getStoredEnquiries().filter(item => item.id !== id);
  saveStoredEnquiries(filtered);
  safeToast("Enquiry record deleted.");
  renderAdminContent(activeAdminTab);
}

function viewEnquiryDetails(id) {
  const enq = getStoredEnquiries().find(item => item.id === id);
  if (!enq) return;

  const detailHtml = `
    <div style="background: #ffffff; padding: 24px; border: 1px solid var(--line); border-radius: 4px; margin-top: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 12px; margin-bottom: 14px;">
        <h4 style="font: 500 24px 'Cormorant Garamond', Georgia, serif; color: var(--green); margin: 0;">
          Enquiry Details: ${escapeHtml(enq.name)}
        </h4>
        <span class="badge-status ${enq.status}">${enq.status}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px;">
        <div><strong>Customer Name:</strong> ${escapeHtml(enq.name)}</div>
        <div><strong>Contact Phone:</strong> ${escapeHtml(enq.phone)}</div>
        <div><strong>Email Address:</strong> ${escapeHtml(enq.email || "Not provided")}</div>
        <div><strong>Event Type:</strong> ${escapeHtml(enq.event)}</div>
        <div><strong>Event Date:</strong> ${escapeHtml(enq.date || "Not specified")}</div>
        <div><strong>Expected Guests:</strong> ${escapeHtml(String(enq.guests || "Not specified"))}</div>
        <div><strong>Food Preference:</strong> ${escapeHtml(enq.food || "Both")}</div>
        <div><strong>Venue / Location:</strong> ${escapeHtml(enq.location || "Not specified")}</div>
        <div style="grid-column: 1 / -1;">
          <strong>Additional Requirements & Notes:</strong>
          <p style="background: #faf8f3; padding: 12px; border: 1px solid var(--line); border-radius: 3px; margin: 6px 0 0; color: #444; font-size: 12.5px; line-height: 1.7;">
            ${escapeHtml(enq.notes || "None provided")}
          </p>
        </div>
        <div style="font-size: 11px; color: var(--muted); grid-column: 1 / -1;">
          Submitted at: ${escapeHtml(enq.created || "Unknown")}
        </div>
      </div>
    </div>
  `;

  // Inject modal or alert view
  const existingDetail = document.getElementById("adminEnquiryDetailBox");
  if (existingDetail) {
    existingDetail.innerHTML = detailHtml;
  } else {
    const div = document.createElement("div");
    div.id = "adminEnquiryDetailBox";
    div.innerHTML = detailHtml;
    const content = document.getElementById("adminContent");
    if (content) content.prepend(div);
  }
}

/* ==========================================================================
   3. MENU MANAGEMENT TAB (FULL CRUD FOR BOTH VEG & NON-VEG)
   ========================================================================== */
function renderAdminMenus(container) {
  const store = getMenuStore();
  const allDishes = [
    ...(store.veg || []).map(d => ({ ...d, type: "veg" })),
    ...(store.nonveg || []).map(d => ({ ...d, type: "nonveg" }))
  ];

  // Filter
  const filtered = allDishes.filter(dish => {
    const matchType = adminMenuTypeFilter === "all" || dish.type === adminMenuTypeFilter;
    if (!matchType) return false;
    if (!adminMenuSearchQuery) return true;
    const haystack = [dish.name, dish.nameTa, dish.desc, dish.descTa, dish.category, dish.badge].join(" ").toLowerCase();
    return haystack.includes(adminMenuSearchQuery);
  });

  container.innerHTML = `
    <!-- Top Action & Filter Bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 20px;">
      <div style="display: flex; gap: 10px; align-items: center; flex: 1; min-width: 280px;">
        <input
          type="search"
          placeholder="Search menu catalogue by dish name or ingredient..."
          value="${escapeHtml(adminMenuSearchQuery)}"
          oninput="adminMenuSearchQuery = this.value.toLowerCase().trim(); renderAdminMenus(document.getElementById('adminContent'));"
          style="flex: 1; padding: 10px 14px; border: 1px solid var(--line); border-radius: 3px; font-size: 12px;"
        />
        <select
          onchange="adminMenuTypeFilter = this.value; renderAdminMenus(document.getElementById('adminContent'));"
          style="padding: 10px 12px; border: 1px solid var(--line); border-radius: 3px; font-size: 12px; background: #fff;"
        >
          <option value="all" ${adminMenuTypeFilter === 'all' ? 'selected' : ''}>All Types (${allDishes.length})</option>
          <option value="veg" ${adminMenuTypeFilter === 'veg' ? 'selected' : ''}>Vegetarian (${(store.veg || []).length})</option>
          <option value="nonveg" ${adminMenuTypeFilter === 'nonveg' ? 'selected' : ''}>Non-Vegetarian (${(store.nonveg || []).length})</option>
        </select>
      </div>
      <div>
        <button class="btn btn-sm btn-dark" onclick="showAddDishForm()">
          + Add New Dish
        </button>
      </div>
    </div>

    <!-- Dish Add / Edit Form Container -->
    <div id="dishFormContainer"></div>

    <!-- Dishes Table -->
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 70px;">Photo</th>
            <th>Dish Name</th>
            <th>Category</th>
            <th>Type</th>
            <th>Description</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(dish => {
            const isVeg = dish.type === "veg";
            const categoryObj = (MENU_CATEGORIES[dish.type] || []).find(c => c.key === dish.category);
            const categoryLabel = categoryObj ? categoryObj.labelEn : dish.category;
            return `
              <tr>
                <td>
                  <img src="${dish.img || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80'}" alt="" style="width: 52px; height: 52px; object-fit: cover; border-radius: 3px; border: 1px solid var(--line);" />
                </td>
                <td>
                  <strong style="color: var(--green); font-size: 13px;">${escapeHtml(dish.name)}</strong>
                  ${dish.nameTa ? `<div style="font-size: 11px; color: var(--muted);">${escapeHtml(dish.nameTa)}</div>` : ""}
                  ${dish.badge ? `<span class="badge-status Confirmed" style="font-size: 9px; padding: 2px 6px; margin-top: 4px; display: inline-block;">${escapeHtml(dish.badge)}</span>` : ""}
                </td>
                <td>
                  <span style="font-size: 11px; font-weight: 600; color: #555;">${escapeHtml(categoryLabel)}</span>
                </td>
                <td>
                  <span class="diet-indicator ${isVeg ? 'veg' : 'nonveg'}" style="display: inline-block; vertical-align: middle; margin-right: 4px; width: 14px; height: 14px;"></span>
                  <span style="font-size: 11.5px; font-weight: 600; color: ${isVeg ? 'var(--veg-color)' : 'var(--nonveg-color)'};">
                    ${isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                </td>
                <td>
                  <div style="font-size: 11.5px; color: var(--muted); max-width: 320px; line-height: 1.5;">
                    ${escapeHtml(dish.desc || "")}
                  </div>
                </td>
                <td style="text-align: right;">
                  <div class="admin-actions" style="justify-content: flex-end;">
                    <button class="btn-action-edit" onclick="showEditDishForm('${dish.id}', '${dish.type}')">
                      Edit
                    </button>
                    <button class="btn-action-del" onclick="deleteDishRecord('${dish.id}', '${dish.type}')">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function showAddDishForm() {
  editingDishId = null;
  editingDishType = null;
  const container = document.getElementById("dishFormContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="admin-form-box">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0;">Add New Dish to Catalogue</h4>
        <button onclick="document.getElementById('dishFormContainer').innerHTML='';" style="background: none; border: 0; font-size: 20px; cursor: pointer; color: var(--muted);">×</button>
      </div>
      <form onsubmit="handleSaveDish(event)">
        <div class="admin-form-grid">
          <div class="admin-field">
            <label>Dish Name (English) *</label>
            <input id="dishFormName" required placeholder="e.g. Kongu Naadu Mutton Chukka" />
          </div>
          <div class="admin-field">
            <label>Dish Name (Tamil)</label>
            <input id="dishFormNameTa" placeholder="e.g. கொங்கு நாட்டு மட்டன் சுக்கா" />
          </div>
          <div class="admin-field">
            <label>Food Type *</label>
            <select id="dishFormType" required onchange="updateFormCategories(this.value)">
              <option value="veg">Vegetarian</option>
              <option value="nonveg">Non-Vegetarian</option>
            </select>
          </div>
          <div class="admin-field">
            <label>Category *</label>
            <select id="dishFormCategory" required></select>
          </div>
          <div class="admin-field">
            <label>Signature Tag / Badge</label>
            <input id="dishFormBadge" placeholder="e.g. Chef Special, Live Counter" />
          </div>
          <div class="admin-field">
            <label>Image URL</label>
            <input id="dishFormImg" placeholder="https://images.unsplash.com/..." />
          </div>
          <div class="admin-field full">
            <label>Description (English)</label>
            <input id="dishFormDesc" placeholder="Crisp, aromatic preparation cooked with..." />
          </div>
          <div class="admin-field full">
            <label>Description (Tamil)</label>
            <input id="dishFormDescTa" placeholder="பாரம்பரிய நறுமண மசாலாக்களுடன்..." />
          </div>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 10px;">
          <button type="submit" class="btn btn-sm btn-dark">Save Dish to Menu</button>
          <button type="button" class="btn btn-sm btn-outline" style="color: var(--muted); border-color: var(--line);" onclick="document.getElementById('dishFormContainer').innerHTML='';">Cancel</button>
        </div>
      </form>
    </div>
  `;

  updateFormCategories("veg");
}

function showEditDishForm(id, type) {
  const store = getMenuStore();
  const dish = (store[type] || []).find(d => d.id === id);
  if (!dish) return;

  editingDishId = id;
  editingDishType = type;

  const container = document.getElementById("dishFormContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="admin-form-box" style="border-left: 4px solid var(--gold);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="margin: 0;">Edit Dish: ${escapeHtml(dish.name)}</h4>
        <button onclick="document.getElementById('dishFormContainer').innerHTML='';" style="background: none; border: 0; font-size: 20px; cursor: pointer; color: var(--muted);">×</button>
      </div>
      <form onsubmit="handleSaveDish(event)">
        <div class="admin-form-grid">
          <div class="admin-field">
            <label>Dish Name (English) *</label>
            <input id="dishFormName" required value="${escapeHtml(dish.name)}" />
          </div>
          <div class="admin-field">
            <label>Dish Name (Tamil)</label>
            <input id="dishFormNameTa" value="${escapeHtml(dish.nameTa || '')}" />
          </div>
          <div class="admin-field">
            <label>Food Type *</label>
            <select id="dishFormType" required onchange="updateFormCategories(this.value)">
              <option value="veg" ${type === 'veg' ? 'selected' : ''}>Vegetarian</option>
              <option value="nonveg" ${type === 'nonveg' ? 'selected' : ''}>Non-Vegetarian</option>
            </select>
          </div>
          <div class="admin-field">
            <label>Category *</label>
            <select id="dishFormCategory" required></select>
          </div>
          <div class="admin-field">
            <label>Signature Tag / Badge</label>
            <input id="dishFormBadge" value="${escapeHtml(dish.badge || '')}" />
          </div>
          <div class="admin-field">
            <label>Image URL</label>
            <input id="dishFormImg" value="${escapeHtml(dish.img || '')}" />
          </div>
          <div class="admin-field full">
            <label>Description (English)</label>
            <input id="dishFormDesc" value="${escapeHtml(dish.desc || '')}" />
          </div>
          <div class="admin-field full">
            <label>Description (Tamil)</label>
            <input id="dishFormDescTa" value="${escapeHtml(dish.descTa || '')}" />
          </div>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 10px;">
          <button type="submit" class="btn btn-sm btn-dark">Update Dish</button>
          <button type="button" class="btn btn-sm btn-outline" style="color: var(--muted); border-color: var(--line);" onclick="document.getElementById('dishFormContainer').innerHTML='';">Cancel</button>
        </div>
      </form>
    </div>
  `;

  updateFormCategories(type, dish.category);
}

function updateFormCategories(foodType, selectedCategory) {
  const catSelect = document.getElementById("dishFormCategory");
  if (!catSelect) return;
  const categories = (MENU_CATEGORIES[foodType] || []).filter(c => c.key !== "all");
  catSelect.innerHTML = categories.map(c => `
    <option value="${c.key}" ${c.key === selectedCategory ? 'selected' : ''}>
      ${c.labelEn} (${c.labelTa})
    </option>
  `).join("");
}

function handleSaveDish(e) {
  e.preventDefault();
  const name = document.getElementById("dishFormName").value.trim();
  const nameTa = document.getElementById("dishFormNameTa").value.trim();
  const type = document.getElementById("dishFormType").value;
  const category = document.getElementById("dishFormCategory").value;
  const badge = document.getElementById("dishFormBadge").value.trim();
  const img = document.getElementById("dishFormImg").value.trim() || (type === "veg"
    ? "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80"
    : "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=700&q=80");
  const desc = document.getElementById("dishFormDesc").value.trim();
  const descTa = document.getElementById("dishFormDescTa").value.trim();

  if (!name) {
    safeToast("Please provide a dish name.");
    return;
  }

  const store = getMenuStore();

  if (editingDishId) {
    // If food type changed, remove from old list and push to new
    if (editingDishType !== type) {
      store[editingDishType] = (store[editingDishType] || []).filter(d => d.id !== editingDishId);
      store[type].push({ id: editingDishId, name, nameTa, type, category, badge, img, desc, descTa });
    } else {
      store[type] = (store[type] || []).map(d => {
        if (d.id === editingDishId) {
          return { ...d, name, nameTa, category, badge, img, desc, descTa };
        }
        return d;
      });
    }
    safeToast(`Updated dish "${name}".`);
  } else {
    // New dish
    const newDish = {
      id: `dish-${Date.now()}`,
      name,
      nameTa,
      type,
      category,
      badge,
      img,
      desc,
      descTa
    };
    if (!store[type]) store[type] = [];
    store[type].unshift(newDish);
    safeToast(`Added new dish "${name}" to ${type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} menu.`);
  }

  saveMenuStore(store);

  // Update public-facing menu instantly
  if (typeof drawMenu === "function") {
    populateCategoryControls();
    drawMenu();
  }

  // Refresh admin menu table
  renderAdminMenus(document.getElementById("adminContent"));
}

function deleteDishRecord(id, type) {
  if (!confirm("Are you sure you want to remove this dish from the catering catalogue?")) return;
  const store = getMenuStore();
  store[type] = (store[type] || []).filter(d => d.id !== id);
  saveMenuStore(store);

  // Update public menu immediately
  if (typeof drawMenu === "function") {
    drawMenu();
  }

  safeToast("Dish removed from menu.");
  renderAdminMenus(document.getElementById("adminContent"));
}

/* ==========================================================================
   4. GALLERY MANAGEMENT TAB
   ========================================================================== */
function getStoredGallery() {
  try {
    const raw = localStorage.getItem("velavan_gallery");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read gallery:", e);
  }
  const clone = JSON.parse(JSON.stringify(DEFAULT_GALLERY_DATA));
  localStorage.setItem("velavan_gallery", JSON.stringify(clone));
  return clone;
}

function saveStoredGallery(gallery) {
  try {
    localStorage.setItem("velavan_gallery", JSON.stringify(gallery));
  } catch (e) {
    console.error("Failed to save gallery:", e);
  }
}

function renderAdminGallery(container) {
  const photos = getStoredGallery();

  container.innerHTML = `
    <!-- Add Gallery Form -->
    <div class="admin-form-box">
      <h4>Add New Photo to Showcase Gallery</h4>
      <form onsubmit="handleSaveGalleryPhoto(event)">
        <div class="admin-form-grid">
          <div class="admin-field">
            <label>Image URL *</label>
            <input id="newGalUrl" required placeholder="https://images.unsplash.com/..." />
          </div>
          <div class="admin-field">
            <label>Title / Heading (English) *</label>
            <input id="newGalTitle" required placeholder="e.g. Royal Muhurtham Dining" />
          </div>
          <div class="admin-field">
            <label>Title (Tamil)</label>
            <input id="newGalTitleTa" placeholder="e.g. முகூர்த்த தலைவாழை விருந்து" />
          </div>
          <div class="admin-field">
            <label>Category *</label>
            <select id="newGalCategory">
              <option value="Wedding">Wedding (திருமணம்)</option>
              <option value="Reception">Reception (வரவேற்பு)</option>
              <option value="Buffet">Buffet (பஃபே)</option>
              <option value="Tradition">Tradition (பாரம்பரியம்)</option>
              <option value="Live Counter">Live Counter (நேரடி கவுண்டர்)</option>
              <option value="Corporate">Corporate (நிறுவன விழா)</option>
              <option value="Family">Family (குடும்ப விழா)</option>
            </select>
          </div>
          <div class="admin-field full">
            <label>Caption / Description</label>
            <input id="newGalCaption" placeholder="Describe the service setup or banquet atmosphere..." />
          </div>
        </div>
        <div style="margin-top: 14px;">
          <button type="submit" class="btn btn-sm btn-dark">Upload to Gallery</button>
        </div>
      </form>
    </div>

    <!-- Gallery Grid -->
    <h4 style="font: 500 22px 'Cormorant Garamond', Georgia, serif; color: var(--green2); margin: 24px 0 14px;">
      Current Gallery Items (${photos.length})
    </h4>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
      ${photos.map((photo, index) => `
        <div style="background: #ffffff; border: 1px solid var(--line); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column;">
          <img src="${escapeHtml(photo.url)}" alt="" style="width: 100%; height: 140px; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=700&q=80';" />
          <div style="padding: 12px; display: flex; flex-direction: column; flex: 1;">
            <span style="font-size: 9px; text-transform: uppercase; color: var(--gold-dark); font-weight: 700;">${escapeHtml(photo.category)}</span>
            <strong style="font-size: 13px; color: var(--green); margin: 3px 0 6px;">${escapeHtml(photo.title)}</strong>
            <p style="font-size: 11px; color: var(--muted); margin: 0 0 12px; line-height: 1.5; flex: 1;">
              ${escapeHtml(photo.caption || '')}
            </p>
            <div style="text-align: right; border-top: 1px solid var(--line); padding-top: 8px;">
              <button class="btn-action-del" onclick="deleteGalleryPhoto(${index})">
                Remove Photo
              </button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function handleSaveGalleryPhoto(e) {
  e.preventDefault();
  const url = document.getElementById("newGalUrl").value.trim();
  const title = document.getElementById("newGalTitle").value.trim();
  const titleTa = document.getElementById("newGalTitleTa").value.trim();
  const category = document.getElementById("newGalCategory").value;
  const caption = document.getElementById("newGalCaption").value.trim();

  if (!url || !title) {
    safeToast("Please provide image URL and title.");
    return;
  }

  const photos = getStoredGallery();
  photos.unshift({
    id: `gal-${Date.now()}`,
    url,
    title,
    titleTa: titleTa || title,
    category,
    categoryTa: category,
    caption,
    captionTa: caption
  });

  saveStoredGallery(photos);
  safeToast("Photo added to gallery.");

  // Re-render public gallery
  if (typeof renderPublicGallery === "function") {
    renderPublicGallery();
  }

  renderAdminGallery(document.getElementById("adminContent"));
}

function deleteGalleryPhoto(index) {
  if (!confirm("Remove this photo from the gallery?")) return;
  const photos = getStoredGallery();
  photos.splice(index, 1);
  saveStoredGallery(photos);

  if (typeof renderPublicGallery === "function") {
    renderPublicGallery();
  }

  safeToast("Photo removed from gallery.");
  renderAdminGallery(document.getElementById("adminContent"));
}

/* ==========================================================================
   5. SETTINGS & CONFIGURATION TAB
   ========================================================================== */
function getStoredConfig() {
  try {
    const raw = localStorage.getItem("velavan_config");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read config:", e);
  }
  localStorage.setItem("velavan_config", JSON.stringify(VELAVAN_DEFAULT_CONFIG));
  return VELAVAN_DEFAULT_CONFIG;
}

function saveStoredConfig(config) {
  try {
    localStorage.setItem("velavan_config", JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save config:", e);
  }
}

function renderAdminSettings(container) {
  const config = getStoredConfig();

  container.innerHTML = `
    <div class="admin-form-box">
      <h4>Business Contact & WhatsApp Configuration</h4>
      <p style="font-size: 12.5px; color: var(--muted); margin-bottom: 20px;">
        Configure the official business WhatsApp number, direct telephone lines, and company email. Changes take effect across the entire website instantly.
      </p>
      <form onsubmit="handleSaveSettings(event)">
        <div class="admin-form-grid">
          <div class="admin-field">
            <label>WhatsApp Number (Country Code + 10 digits)</label>
            <input id="cfgWhatsApp" value="${escapeHtml(config.whatsappPhone || '')}" placeholder="e.g. 919840012345" />
            <small style="color: var(--muted); font-size: 10px;">Numbers only, no spaces or '+' symbol.</small>
          </div>
          <div class="admin-field">
            <label>Official Telephone</label>
            <input id="cfgPhone" value="${escapeHtml(config.phone || '')}" placeholder="+91 98400 12345" />
          </div>
          <div class="admin-field">
            <label>Official Email</label>
            <input id="cfgEmail" type="email" value="${escapeHtml(config.email || '')}" placeholder="enquiry@velavancatering.com" />
          </div>
          <div class="admin-field full">
            <label>Business Address (English)</label>
            <input id="cfgAddress" value="${escapeHtml(config.address || '')}" />
          </div>
          <div class="admin-field full">
            <label>Business Address (Tamil)</label>
            <input id="cfgAddressTa" value="${escapeHtml(config.addressTa || '')}" />
          </div>
        </div>
        <div style="margin-top: 18px;">
          <button type="submit" class="btn btn-sm btn-dark">Save Configuration</button>
        </div>
      </form>
    </div>

    <!-- Reset Demo Data Section -->
    <div style="background: #fff8f8; border: 1px solid #f1c2c2; border-radius: 4px; padding: 22px; margin-top: 24px;">
      <h4 style="font: 500 22px 'Cormorant Garamond', Georgia, serif; color: #a83232; margin: 0 0 8px;">
        Reset Prototype Demo Data
      </h4>
      <p style="font-size: 12.5px; color: #666; margin: 0 0 16px; line-height: 1.6;">
        This action clears all browser modifications and restores the rich 60+ dish seed catalogue, default gallery photos, sample enquiries, and default contact settings.
      </p>
      <button class="btn btn-sm btn-action-del" style="background: #a83232; color: #fff; padding: 10px 18px;" onclick="resetAllDemoData()">
        ↻ Reset All Demo Data to Defaults
      </button>
    </div>
  `;
}

function handleSaveSettings(e) {
  e.preventDefault();
  const config = getStoredConfig();
  config.whatsappPhone = document.getElementById("cfgWhatsApp").value.trim();
  config.phone = document.getElementById("cfgPhone").value.trim();
  config.email = document.getElementById("cfgEmail").value.trim();
  config.address = document.getElementById("cfgAddress").value.trim();
  config.addressTa = document.getElementById("cfgAddressTa").value.trim();

  saveStoredConfig(config);
  safeToast("Business contact settings updated.");

  // Update footer contact values if present
  if (typeof updateContactDisplay === "function") {
    updateContactDisplay();
  }
}

function resetAllDemoData() {
  if (!confirm("Are you sure you want to restore all original sample menus, gallery images, and demo enquiries? Any temporary additions in this browser will be reset.")) return;

  localStorage.removeItem("velavan_menu");
  localStorage.removeItem("velavan_enquiries");
  localStorage.removeItem("velavan_gallery");
  localStorage.removeItem("velavan_config");

  // Re-seed
  localStorage.setItem("velavan_menu", JSON.stringify(JSON.parse(JSON.stringify(DEFAULT_MENU_DATA))));
  localStorage.setItem("velavan_enquiries", JSON.stringify(JSON.parse(JSON.stringify(DEFAULT_SAMPLE_ENQUIRIES))));
  localStorage.setItem("velavan_gallery", JSON.stringify(JSON.parse(JSON.stringify(DEFAULT_GALLERY_DATA))));
  localStorage.setItem("velavan_config", JSON.stringify(JSON.parse(JSON.stringify(VELAVAN_DEFAULT_CONFIG))));

  safeToast("Demo data successfully restored to factory defaults.");

  // Update public views
  if (typeof drawMenu === "function") {
    populateCategoryControls();
    drawMenu();
  }
  if (typeof renderPublicGallery === "function") {
    renderPublicGallery();
  }

  // Refresh admin view
  renderAdminContent(activeAdminTab);
}

/**
 * HTML Escaping utility
 */
function safeToast(msg) {
  if (typeof showToast === "function") {
    showToast(msg);
  } else {
    console.log("[Toast]", msg);
  }
}

/**
 * HTML Escaping utility
 */
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}
