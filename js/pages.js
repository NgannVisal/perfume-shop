/* ===========================================
   Perfume Atelier — Page Interactions Script
   Works for Contact, Careers, About
   =========================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 🌸 CONTACT FORM HANDLER
  const contactForm = document.querySelector(".contact-form");
  
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Show popup success message
      const popup = document.createElement("div");
      popup.className = "popup-message";
      popup.textContent = "✅ Message Sent Successfully!";
      document.body.appendChild(popup);

      // Animate popup and remove after a few seconds
      setTimeout(() => {
        popup.classList.add("show");
      }, 100);

      setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.remove(), 500);
      }, 3000);

      // Clear form fields
      contactForm.reset();
    });
  }

  // 🌸 CAREER PAGE — “Apply Now” Buttons
  const applyButtons = document.querySelectorAll(".job-card .btn");
  applyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      alert("📧 Please send your resume to careers@perfumeatelier.com");
    });
  });

  // 🌸 ABOUT PAGE — Optional scroll animation (for fade-in)
  const fadeElements = document.querySelectorAll(".about-content, .job-card, .contact-section");
  const fadeInOnScroll = () => {
    fadeElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        el.classList.add("visible");
      }
    });
  };
  
  window.addEventListener("scroll", fadeInOnScroll);
  fadeInOnScroll();
});
