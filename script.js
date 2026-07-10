(() => {
  const config = window.PRINT_CASE_CONFIG || {};
  const models = window.PRINT_CASE_MODELS || {};
  const brandsList = document.getElementById("brandsList");
  const storageKey = "kupy-yabluko-open-brands";

  const brandCodes = {
    Apple: "APL",
    Samsung: "SAM",
    Google: "G",
    Xiaomi: "MI",
    Honor: "HON",
    Huawei: "HUA",
    OnePlus: "1+",
    Nothing: "NT",
    OPPO: "OP",
    Vivo: "VI",
    Motorola: "M"
  };

  const total = Object.values(models).reduce((sum, list) => sum + list.length, 0);
  document.getElementById("totalCount").textContent = `${total} моделей`;

  const savedOpenBrands = loadOpenBrands();

  Object.entries(models).forEach(([brandName, brandModels], index) => {
    const brand = document.createElement("article");
    brand.className = "brand";
    brand.dataset.brand = brandName;

    const button = document.createElement("button");
    button.className = "brand-toggle";
    button.type = "button";

    const panelId = `models-${index}`;
    button.setAttribute("aria-controls", panelId);

    button.innerHTML = `
      <span class="brand-name-wrap">
        <span class="brand-badge" aria-hidden="true">${brandCodes[brandName] || brandName.slice(0, 2).toUpperCase()}</span>
        <span>
          <span class="brand-name">${escapeHtml(brandName)}</span>
          <span class="brand-count"> (${brandModels.length})</span>
        </span>
      </span>
      <svg class="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

    const panel = document.createElement("div");
    panel.className = "models-panel";
    panel.id = panelId;
    const listItems = brandModels.map(model => `<li>${escapeHtml(model)}</li>`).join("");
    panel.innerHTML = `<div class="models-inner"><ul class="models-list">${listItems}</ul></div>`;

    const initiallyOpen = savedOpenBrands.has(brandName);
    brand.classList.toggle("is-open", initiallyOpen);
    button.setAttribute("aria-expanded", String(initiallyOpen));

    button.addEventListener("click", () => {
      const open = brand.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
      saveOpenBrands();
    });

    brand.append(button, panel);
    brandsList.appendChild(brand);
  });

  setLink("instagramButton", config.instagramUrl);
  setLink("telegramButton", config.telegramUrl);
  document.getElementById("pickupText").textContent = config.storePickupText || "";
  document.getElementById("footerText").textContent = config.footerText || "© Купи Яблуко";

  if (config.logoUrl) {
    const logo = document.getElementById("logoImage");
    logo.src = config.logoUrl;
    logo.hidden = false;
    document.getElementById("logoPlaceholder").hidden = true;
  }

  if (config.backgroundImageUrl) {
    document.querySelector(".page-bg").style.backgroundImage = `url("${config.backgroundImageUrl}")`;
  }

  requestAnimationFrame(() => {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -35px" });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  function setLink(id, url) {
    const element = document.getElementById(id);
    const valid = typeof url === "string" && url.trim() && url !== "#";
    element.href = valid ? url : "#";
    element.setAttribute("aria-disabled", String(!valid));
    if (!valid) element.removeAttribute("target");
  }

  function loadOpenBrands() {
    try {
      return new Set(JSON.parse(localStorage.getItem(storageKey) || "[]"));
    } catch {
      return new Set();
    }
  }

  function saveOpenBrands() {
    try {
      const openBrands = [...document.querySelectorAll(".brand.is-open")]
        .map(item => item.dataset.brand);
      localStorage.setItem(storageKey, JSON.stringify(openBrands));
    } catch {
      // The site remains fully usable when storage is unavailable.
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }
})();
