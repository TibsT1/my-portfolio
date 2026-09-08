const body = document.body;
const themeButtons = document.querySelectorAll(".theme-button");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const navIndicator = document.querySelector(".site-nav__indicator");
const scrollTopButton = document.querySelector(".scroll-top");
const revealItems = document.querySelectorAll(".reveal");

const themeWipe = document.createElement("div");
themeWipe.className = "theme-wipe";
themeWipe.setAttribute("aria-hidden", "true");
document.body.appendChild(themeWipe);

function easeOutQuart(value) {
  return 1 - Math.pow(1 - value, 4);
}

function smoothScrollTo(targetY, duration = 760) {
  const startY = window.scrollY;
  const difference = targetY - startY;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + difference * easeOutQuart(progress));

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function updateIndicator(link) {
  if (!link || !navIndicator || window.innerWidth <= 960) return;

  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const left = linkRect.left - navRect.left;

  navIndicator.style.width = `${linkRect.width}px`;
  navIndicator.style.transform = `translate(${left}px, -50%)`;
  navIndicator.style.opacity = "1";
}

function setActivePage() {
  const page = document.documentElement.dataset.page;
  const activeLink = document.querySelector(`.site-nav a[data-page="${page}"]`);

  navLinks.forEach((link) => link.classList.toggle("active", link === activeLink));
  updateIndicator(activeLink);
}

function applyTheme(isLight) {
  body.classList.toggle("light-mode", isLight);
  themeButtons.forEach((button) => button.setAttribute("aria-pressed", String(isLight)));
  localStorage.setItem("tibi-portfolio-theme", isLight ? "light" : "dark");
}

if (localStorage.getItem("tibi-portfolio-theme") === "light") {
  applyTheme(true);
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const isLight = !body.classList.contains("light-mode");

    themeWipe.classList.remove("is-active");
    void themeWipe.offsetWidth;
    themeWipe.classList.add("is-active");

    window.setTimeout(() => applyTheme(isLight), 210);
  });
});

menuButton?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.textContent = isOpen ? "Close" : "Menu";
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    link.classList.add("is-clicked");
    window.setTimeout(() => link.classList.remove("is-clicked"), 240);

    if (nav?.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.textContent = "Menu";
    }
  });
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
window.addEventListener("resize", setActivePage);

document.getElementById("year").textContent = new Date().getFullYear();
setActivePage();
updateScrollButton();
