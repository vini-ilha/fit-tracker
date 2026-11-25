
// FITTRACK — interações da interface
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const body = document.body;
const toast = $("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// Ano do rodapé
$("#currentYear").textContent = new Date().getFullYear();

// Tema claro/escuro
function toggleTheme() {
  body.classList.toggle("dark-theme");
  const dark = body.classList.contains("dark-theme");
  $("#themeToggle").setAttribute("aria-label", dark ? "Ativar modo claro" : "Ativar modo escuro");
  try { localStorage.setItem("fittrack-theme", dark ? "dark" : "light"); } catch (error) {}
}

try {
  if (localStorage.getItem("fittrack-theme") === "dark") body.classList.add("dark-theme");
} catch (error) {}

$("#themeToggle").addEventListener("click", toggleTheme);
$("#panelThemeToggle").addEventListener("click", toggleTheme);

// Menu responsivo
const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

$$(".nav-link").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

// Painel de acessibilidade
const accessPanel = $("#accessPanel");
const accessBackdrop = $("#accessBackdrop");
let fontScale = 1;

function openAccessPanel() {
  accessBackdrop.hidden = false;
  accessPanel.classList.add("open");
  accessPanel.setAttribute("aria-hidden", "false");
  $("#accessClose").focus();
}

function closeAccessPanel() {
  accessPanel.classList.remove("open");
  accessPanel.setAttribute("aria-hidden", "true");
  accessBackdrop.hidden = true;
  $("#accessOpen").focus();
}

$("#accessOpen").addEventListener("click", openAccessPanel);
$("#footerAccess").addEventListener("click", openAccessPanel);
$("#accessClose").addEventListener("click", closeAccessPanel);
accessBackdrop.addEventListener("click", closeAccessPanel);

function updateFont() {
  document.documentElement.style.setProperty("--font-scale", fontScale);
}

$("#fontIncrease").addEventListener("click", () => {
  fontScale = Math.min(1.25, +(fontScale + .05).toFixed(2));
  updateFont();
});

$("#fontDecrease").addEventListener("click", () => {
  fontScale = Math.max(.85, +(fontScale - .05).toFixed(2));
  updateFont();
});

$("#fontReset").addEventListener("click", () => {
  fontScale = 1;
  updateFont();
});

$("#contrastToggle").addEventListener("change", event => {
  body.classList.toggle("high-contrast", event.target.checked);
});

$("#motionToggle").addEventListener("change", event => {
  body.classList.toggle("reduce-motion", event.target.checked);
});

$("#accessReset").addEventListener("click", () => {
  fontScale = 1;
  updateFont();
  body.classList.remove("high-contrast", "reduce-motion");
  $("#contrastToggle").checked = false;
  $("#motionToggle").checked = false;
  showToast("Preferências restauradas.");
});

// Pesquisa e filtros dos cartões
let activeFilter = "todos";
const searchInput = $("#contentSearch");

function filterCards() {
  const term = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  let visible = 0;

  $$(".content-card").forEach(card => {
    const matchesFilter = activeFilter === "todos" || card.dataset.category === activeFilter;
    const matchesText = (card.dataset.search + " " + card.textContent).toLocaleLowerCase("pt-BR").includes(term);
    const show = matchesFilter && matchesText;

    card.hidden = !show;
    if (show) visible++;
  });

  $("#emptyState").hidden = visible !== 0;
}

searchInput.addEventListener("input", filterCards);

$$(".filter-tab").forEach(tab => tab.addEventListener("click", () => {
  $$(".filter-tab").forEach(item => {
    item.classList.remove("selected");
    item.setAttribute("aria-selected", "false");
  });

  tab.classList.add("selected");
  tab.setAttribute("aria-selected", "true");
  activeFilter = tab.dataset.filter;
  filterCards();
}));

// Carrossel de mensagens
const slides = $$(".quote-slide");
const dots = $$(".dot");
let currentSlide = 0;

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === currentSlide);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);

    if (i === currentSlide) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
}

$("#prevSlide").addEventListener("click", () => showSlide(currentSlide - 1));
$("#nextSlide").addEventListener("click", () => showSlide(currentSlide + 1));
dots.forEach((dot, i) => dot.addEventListener("click", () => showSlide(i)));

// Modal de login demonstrativo
const loginModal = $("#loginModal");

function openLogin() {
  loginModal.hidden = false;
  $("#loginEmail").focus();
}

function closeLogin() {
  loginModal.hidden = true;
  $("#loginOpen").focus();
}

$("#loginOpen").addEventListener("click", openLogin);
$("#loginClose").addEventListener("click", closeLogin);

loginModal.addEventListener("click", event => {
  if (event.target === loginModal) closeLogin();
});

$("#loginForm").addEventListener("submit", event => {
  event.preventDefault();
  $("#loginFeedback").textContent = "Demonstração: os dados foram validados localmente. Nenhuma conta foi criada.";
});

// Formulário de contato: validação no navegador, sem envio a servidor
$("#contactForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#name");
  const email = $("#email");
  const message = $("#message");
  let valid = true;

  $("#nameError").textContent = "";
  $("#emailError").textContent = "";
  $("#messageError").textContent = "";

  if (name.value.trim().length < 2) {
    $("#nameError").textContent = "Informe um nome com pelo menos 2 caracteres.";
    valid = false;
  }

  if (!email.validity.valid || !email.value.trim()) {
    $("#emailError").textContent = "Informe um endereço de e-mail válido.";
    valid = false;
  }

  if (message.value.trim().length < 10) {
    $("#messageError").textContent = "A mensagem deve ter pelo menos 10 caracteres.";
    valid = false;
  }

  if (!valid) {
    $(".field-error:not(:empty)").previousElementSibling?.focus();
    $("#formFeedback").textContent = "Revise os campos destacados.";
    return;
  }

  $("#formFeedback").textContent = "Mensagem validada! Como este é um projeto demonstrativo, ela não foi enviada a um servidor.";
  event.target.reset();
});

// Fecha janelas com Escape
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (!loginModal.hidden) closeLogin();
    if (accessPanel.classList.contains("open")) closeAccessPanel();

    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});
