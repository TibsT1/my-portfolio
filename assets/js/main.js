const body = document.body;
const themeButtons = document.querySelectorAll(".theme-button");
const navLinks = document.querySelectorAll(".sidebar-nav a, .mobile-nav a");
const desktopNavLinks = document.querySelectorAll(".sidebar-nav a");
const navIndicator = document.querySelector(".sidebar-nav__indicator");
const internalLinks = document.querySelectorAll('a[href^="#"]');
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const mobileMenuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");
const scrollTopButton = document.querySelector(".scroll-top");
const cvModal = document.querySelector(".cv-modal");
const openCvButtons = document.querySelectorAll("[data-open-cv]");
const closeCvButton = document.querySelector("[data-close-cv]");

const themeWipe = document.createElement("div");
themeWipe.className = "theme-wipe";
themeWipe.setAttribute("aria-hidden", "true");
document.body.appendChild(themeWipe);

function easeOutQuart(value) {
  return 1 - Math.pow(1 - value, 4);
}

function smoothScrollTo(targetY, duration = 850) {
  const startY = window.scrollY;
  const difference = targetY - startY;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuart(progress);

    window.scrollTo(0, startY + difference * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function moveDesktopIndicator(link) {
  if (!link || !navIndicator) return;

  navIndicator.style.height = `${link.offsetHeight}px`;
  navIndicator.style.transform = `translateY(${link.offsetTop}px)`;
  navIndicator.style.opacity = "1";
}

function setActiveLink(hash) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === hash;
    link.classList.toggle("active", isActive);

    if (isActive && link.closest(".sidebar-nav")) {
      moveDesktopIndicator(link);
    }
  });
}

function applyTheme(isLight) {
  body.classList.toggle("light-mode", isLight);
  themeButtons.forEach((button) => button.setAttribute("aria-pressed", String(isLight)));
  localStorage.setItem("tibi-portfolio-theme", isLight ? "light" : "dark");
}

const savedTheme = localStorage.getItem("tibi-portfolio-theme");
if (savedTheme === "light") {
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

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    link.classList.add("is-clicked");
    window.setTimeout(() => link.classList.remove("is-clicked"), 260);

    setActiveLink(targetId);

    const targetY = target.getBoundingClientRect().top + window.scrollY;
    smoothScrollTo(targetY, 900);
    history.pushState(null, "", targetId);

    if (mobileNav?.classList.contains("is-open")) {
      mobileNav.classList.remove("is-open");
      mobileMenuButton.setAttribute("aria-expanded", "false");
      mobileMenuButton.textContent = "Menu";
    }
  });
});

mobileMenuButton?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("is-open");
  mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
  mobileMenuButton.textContent = isOpen ? "Close" : "Menu";
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

  if (visible.length > 0) {
    setActiveLink(`#${visible[0].target.id}`);
  }
}, {
  rootMargin: "-22% 0px -56% 0px",
  threshold: [0.12, 0.35, 0.6],
});

sections.forEach((section) => sectionObserver.observe(section));

function updateScrollUi() {
  const atTop = window.scrollY < 160;

  scrollTopButton.classList.toggle("is-visible", !atTop);

  if (atTop) {
    navLinks.forEach((link) => link.classList.remove("active"));
    if (navIndicator) navIndicator.style.opacity = "0";
  }
}

window.addEventListener("scroll", updateScrollUi, { passive: true });
window.addEventListener("resize", () => moveDesktopIndicator(document.querySelector(".sidebar-nav a.active")));

scrollTopButton.addEventListener("click", () => {
  smoothScrollTo(0, 850);
  navLinks.forEach((link) => link.classList.remove("active"));
  if (navIndicator) navIndicator.style.opacity = "0";
  history.pushState(null, "", window.location.pathname);
});

function openCvModal() {
  cvModal.classList.add("is-open");
  cvModal.setAttribute("aria-hidden", "false");
  body.style.overflow = "hidden";
  closeCvButton.focus();
}

function closeCvModal() {
  cvModal.classList.remove("is-open");
  cvModal.setAttribute("aria-hidden", "true");
  body.style.overflow = "";
}

openCvButtons.forEach((button) => button.addEventListener("click", openCvModal));
closeCvButton.addEventListener("click", closeCvModal);

cvModal.addEventListener("click", (event) => {
  if (event.target === cvModal) {
    closeCvModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cvModal.classList.contains("is-open")) {
    closeCvModal();
  }
});

if (window.location.hash) {
  window.setTimeout(() => setActiveLink(window.location.hash), 120);
}

updateScrollUi();
document.getElementById("year").textContent = new Date().getFullYear();
