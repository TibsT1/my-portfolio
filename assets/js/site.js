const body = document.body;
const nav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const navIndicator = document.querySelector(".nav-indicator");
const menuToggle = document.querySelector(".menu-toggle");
const themeToggle = document.querySelector(".theme-toggle");
const themeWipe = document.querySelector(".theme-wipe");
const scrollTopButton = document.querySelector(".scroll-top");
const revealItems = document.querySelectorAll(".reveal");
const cvLinks = document.querySelectorAll("[data-cv-link]");

const safeStorage = {
  get(key) {
    try { return window.localStorage.getItem(key); }
    catch { return null; }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value); }
    catch { /* storage can be unavailable in some preview contexts */ }
  }
};

function easeOutQuart(value) {
  return 1 - Math.pow(1 - value, 4);
}

function smoothScrollTo(targetY, duration = 760) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeOutQuart(progress));
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function openMenu() {
  if (!nav || !menuToggle) return;
  nav.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.textContent = "Close";
}

function closeMenu() {
  if (!nav || !menuToggle) return;
  nav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "Menu";
}

function updateCvLinks() {
  const settings = window.PORTFOLIO_SETTINGS || {};
  const cvUrl = settings.cvUrl || "assets/documents/cv.html";
  const target = settings.cvOpensInNewTab === false ? "_self" : "_blank";

  cvLinks.forEach((link) => {
    link.setAttribute("href", cvUrl);
    link.setAttribute("target", target);
    if (target === "_blank") link.setAttribute("rel", "noopener noreferrer");
  });
}

function updateActiveNav() {
  const page = document.documentElement.dataset.page;
  const active = document.querySelector(`.site-nav a[data-page="${page}"]`);

  navLinks.forEach((link) => {
    link.classList.toggle("active", link === active);
  });

  if (!active || !navIndicator || window.innerWidth <= 900) {
    if (navIndicator) navIndicator.style.opacity = "0";
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const linkRect = active.getBoundingClientRect();

  navIndicator.style.width = `${linkRect.width}px`;
  navIndicator.style.transform = `translate(${linkRect.left - navRect.left}px, -50%)`;
  navIndicator.style.opacity = "1";
}

function setTheme(isLight) {
  body.classList.toggle("light-mode", isLight);
  themeToggle?.setAttribute("aria-pressed", String(isLight));
  safeStorage.set("tibi-portfolio-theme", isLight ? "light" : "dark");
}

if (safeStorage.get("tibi-portfolio-theme") === "light") {
  setTheme(true);
}

themeToggle?.addEventListener("click", () => {
  const shouldUseLight = !body.classList.contains("light-mode");
  themeWipe?.classList.remove("is-active");
  void themeWipe?.offsetWidth;
  themeWipe?.classList.add("is-active");
  window.setTimeout(() => setTheme(shouldUseLight), 210);
});

menuToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  if (nav?.classList.contains("is-open")) closeMenu();
  else openMenu();
});

nav?.addEventListener("click", (event) => {
  event.stopPropagation();
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    link.classList.add("is-clicked");
    window.setTimeout(() => link.classList.remove("is-clicked"), 240);
    closeMenu();
  });
});

document.addEventListener("click", (event) => {
  if (window.innerWidth > 900) return;
  if (!nav?.classList.contains("is-open")) return;
  if (event.target.closest(".site-header")) return;
  closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    smoothScrollTo(target.getBoundingClientRect().top + window.scrollY, 760);
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => revealObserver.observe(item));

function updateScrollButton() {
  scrollTopButton?.classList.toggle("is-visible", window.scrollY > 420);
}

scrollTopButton?.addEventListener("click", () => smoothScrollTo(0, 760));

window.addEventListener("scroll", updateScrollButton, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
  updateActiveNav();
});
window.addEventListener("load", () => {
  updateActiveNav();
  window.setTimeout(updateActiveNav, 120);
});

document.getElementById("year").textContent = new Date().getFullYear();
updateCvLinks();
updateActiveNav();
updateScrollButton();
