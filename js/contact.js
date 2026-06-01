/**
 * Satguru Valve Corporation - Contact Page Interactive Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 1. Sticky Header
  // ==========================================================================
  const header = document.querySelector(".main-header");
  if (header) {
    header.classList.add("scrolled");
  }

  // ==========================================================================
  // 2. Mobile Nav Dropdown Control
  // ==========================================================================
  const mobileHamburger = document.querySelector(".mobile-hamburger");
  const mobileNavDropdown = document.querySelector(".mobile-nav-dropdown");
  const dropdownLinks = document.querySelectorAll(".mobile-dropdown-link");
  const mainHeader = document.querySelector(".main-header");

  const syncDropdownTop = () => {
    if (mainHeader && mobileNavDropdown) {
      mobileNavDropdown.style.top = (mainHeader.getBoundingClientRect().height - 2) + "px";
    }
  };

  const toggleMobileMenu = () => {
    syncDropdownTop();
    mobileHamburger.classList.toggle("active");
    mobileNavDropdown.classList.toggle("active");
    if (mainHeader) mainHeader.classList.toggle("menu-open");
  };

  const closeMobileMenu = () => {
    if (mobileHamburger) mobileHamburger.classList.remove("active");
    if (mobileNavDropdown) mobileNavDropdown.classList.remove("active");
    if (mainHeader) mainHeader.classList.remove("menu-open");
  };

  if (mobileHamburger) {
    mobileHamburger.addEventListener("click", toggleMobileMenu);
  }
  dropdownLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  window.addEventListener("resize", () => {
    if (mobileNavDropdown && mobileNavDropdown.classList.contains("active")) {
      syncDropdownTop();
    }
  });

  // ==========================================================================
  // 3. Enquiry Modal System
  // ==========================================================================
  const modalOverlay = document.getElementById("enquiry-modal");
  const closeButtons = document.querySelectorAll(".modal-close-btn");

  const openModal = () => {
    closeMobileMenu();
    if (modalOverlay) {
      modalOverlay.classList.add("active");
      document.body.classList.add("overflow-hidden");
      const nameInput = document.getElementById("enquiry-name");
      if (nameInput) setTimeout(() => nameInput.focus(), 200);
    }
  };

  const closeModal = () => {
    if (modalOverlay) {
      modalOverlay.classList.remove("active");
      document.body.classList.remove("overflow-hidden");
    }
  };

  document
    .querySelectorAll("[data-open-modal='enquiry-modal']")
    .forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        openModal();
      });
    });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  const enquiryForm = document.getElementById("enquiry-form-element");
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thank you for your enquiry. Our team will get back to you shortly.");
      closeModal();
      enquiryForm.reset();
    });
  }

  // ==========================================================================
  // 4. Newsletter Signup Verification & Feedback
  // ==========================================================================
  const newsletterForm = document.querySelector(".footer-newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector(".footer-input");
      const email = emailInput.value.trim();

      if (email) {
        alert(`Success! "${email}" has been successfully subscribed to SVC newsletter updates.`);
        emailInput.value = "";
      }
    });
  }

  // ==========================================================================
  // 5. B2B Contact Form Validation & Submission
  // ==========================================================================
  const contactForm = document.getElementById("b2b-contact-form-element");
  const feedbackMessage = document.getElementById("contact-feedback");

  if (contactForm && feedbackMessage) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Retrieve field values
      const fullName = document.getElementById("contact-name").value.trim();
      const companyName = document.getElementById("contact-company").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const phone = document.getElementById("contact-phone").value.trim();
      const subject = document.getElementById("contact-subject").value;
      const message = document.getElementById("contact-message").value.trim();

      // Simple frontend validation assertion
      if (!fullName || !companyName || !email || !phone || !subject || !message) {
        feedbackMessage.className = "form-feedback-message error";
        feedbackMessage.innerHTML = `
          <span class="material-symbols-outlined">error</span>
          <span>Please fill in all required fields marked with an asterisk (*).</span>
        `;
        feedbackMessage.style.display = "flex";
        return;
      }

      // Simulate B2B API request / submission
      feedbackMessage.className = "form-feedback-message success";
      feedbackMessage.innerHTML = `
        <span class="material-symbols-outlined">check_circle</span>
        <span>Inquiry sent successfully! Our engineering team will review your request and get back to you within 24 hours.</span>
      `;
      feedbackMessage.style.display = "flex";

      // Scroll feedback message into view smoothly
      feedbackMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });

      // Trigger success browser alert for redundant visual feedback
      setTimeout(() => {
        alert(`Thank you, ${fullName}! Your inquiry regarding "${subject}" for ${companyName} has been successfully sent.`);
        contactForm.reset();
      }, 100);
    });
  }
});
