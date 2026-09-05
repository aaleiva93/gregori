(function () {
  "use strict";

  var hamburger = document.getElementById("hamburger");
  var nav = document.getElementById("nav");

  function closeMenu() {
    if (nav) nav.classList.remove("open");
    if (hamburger) hamburger.setAttribute("aria-expanded", "false");
  }

  if (hamburger && nav) {
    hamburger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".nav a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  var header = document.getElementById("header");
  if (header) {
    header.addEventListener("click", function (e) {
      if (e.target.closest(".brand")) closeMenu();
    });
  }

  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var summary = item.querySelector("summary");
    if (!summary) return;
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = item.hasAttribute("open");
      faqItems.forEach(function (other) {
        other.removeAttribute("open");
      });
      if (!isOpen) item.setAttribute("open", "open");
    });
  });

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }
})();
