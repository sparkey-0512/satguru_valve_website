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

      const name = document.getElementById("enquiry-name").value.trim();
      const company = document.getElementById("enquiry-company").value.trim();
      const email = document.getElementById("enquiry-email").value.trim();
      const phone = document.getElementById("enquiry-phone").value.trim();
      const subject = document.getElementById("enquiry-subject").value;
      const messageText = document.getElementById("enquiry-msg").value.trim();

      // Retrieve Turnstile token
      const turnstileResponse = enquiryForm.querySelector("[name='cf-turnstile-response']");
      const turnstileToken = turnstileResponse ? turnstileResponse.value : "";

      if (!name || !email || !messageText) {
        alert("Name, email, and message are required.");
        return;
      }

      if (!turnstileToken) {
        alert("Please complete the bot verification check.");
        return;
      }

      const submitBtn = enquiryForm.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;

      fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          company,
          phone,
          email,
          message: `[Inquiry Type: ${subject}]\n\n${messageText}`,
          turnstileToken,
        }),
      })
        .then((response) => response.json().then((data) => ({ status: response.status, data })))
        .then(({ status, data }) => {
          if (status === 200 && data.success) {
            alert("Thank you for your enquiry. Our team will get back to you shortly.");
            closeModal();
            enquiryForm.reset();
            if (typeof turnstile !== "undefined") {
              turnstile.reset(enquiryForm);
            }
          } else {
            alert(`Failed to send enquiry: ${data.error || "Please try again."}`);
            if (typeof turnstile !== "undefined") {
              turnstile.reset(enquiryForm);
            }
          }
        })
        .catch((err) => {
          console.error(err);
          alert("An error occurred. Please try again later.");
          if (typeof turnstile !== "undefined") {
            turnstile.reset(enquiryForm);
          }
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
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
        const submitBtn = newsletterForm.querySelector("button[type='submit']");
        if (submitBtn) submitBtn.disabled = true;
        emailInput.disabled = true;

        fetch("/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })
          .then((response) => response.json().then((data) => ({ status: response.status, data })))
          .then(({ status, data }) => {
            if (status === 200 && data.success) {
              alert(`Success! "${email}" has been successfully subscribed to SVC newsletter updates.`);
              emailInput.value = "";
            } else {
              alert(`Subscription failed: ${data.error || "Please try again."}`);
            }
          })
          .catch((err) => {
            console.error(err);
            alert("An error occurred. Please try again later.");
          })
          .finally(() => {
            if (submitBtn) submitBtn.disabled = false;
            emailInput.disabled = false;
          });
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

      // Retrieve Turnstile token
      const turnstileResponse = contactForm.querySelector("[name='cf-turnstile-response']");
      const turnstileToken = turnstileResponse ? turnstileResponse.value : "";

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

      if (!turnstileToken) {
        feedbackMessage.className = "form-feedback-message error";
        feedbackMessage.innerHTML = `
          <span class="material-symbols-outlined">error</span>
          <span>Please complete the bot verification check.</span>
        `;
        feedbackMessage.style.display = "flex";
        return;
      }

      const submitBtn = contactForm.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;

      // Show sending state
      feedbackMessage.className = "form-feedback-message info";
      feedbackMessage.innerHTML = `
        <span class="material-symbols-outlined">sync</span>
        <span>Sending inquiry...</span>
      `;
      feedbackMessage.style.display = "flex";

      fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          company: companyName,
          email: email,
          phone: phone,
          message: `[Inquiry Type: ${subject}]\n\n${message}`,
          turnstileToken,
        }),
      })
        .then((response) => response.json().then((data) => ({ status: response.status, data })))
        .then(({ status, data }) => {
          if (status === 200 && data.success) {
            feedbackMessage.className = "form-feedback-message success";
            feedbackMessage.innerHTML = `
              <span class="material-symbols-outlined">check_circle</span>
              <span>Inquiry sent successfully! Our engineering team will review your request and get back to you within 24 hours.</span>
            `;
            feedbackMessage.style.display = "flex";
            feedbackMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });

            setTimeout(() => {
              alert(`Thank you, ${fullName}! Your inquiry regarding "${subject}" for ${companyName} has been successfully sent.`);
              contactForm.reset();
              if (typeof turnstile !== "undefined") {
                turnstile.reset(contactForm);
              }
            }, 100);
          } else {
            feedbackMessage.className = "form-feedback-message error";
            feedbackMessage.innerHTML = `
              <span class="material-symbols-outlined">error</span>
              <span>Failed to send inquiry: ${data.error || "Please try again."}</span>
            `;
            feedbackMessage.style.display = "flex";
            if (typeof turnstile !== "undefined") {
              turnstile.reset(contactForm);
            }
          }
        })
        .catch((err) => {
          console.error(err);
          feedbackMessage.className = "form-feedback-message error";
          feedbackMessage.innerHTML = `
            <span class="material-symbols-outlined">error</span>
            <span>An error occurred. Please try again later.</span>
          `;
          feedbackMessage.style.display = "flex";
          if (typeof turnstile !== "undefined") {
            turnstile.reset(contactForm);
          }
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
});
