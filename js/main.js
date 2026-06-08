/**
 * Satguru Valve Corporation (Satguru Valve Website) - Main Interactive Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 1. Sticky Header Animation
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

  // Dynamically align dropdown below the actual header height
  const syncDropdownTop = () => {
    if (mainHeader && mobileNavDropdown) {
      // Subtract 2px so dropdown tucks slightly under the header,
      // hiding any sub-pixel gap between sticky and fixed elements.
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

  // Keep dropdown aligned if the window is resized while it's open
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
  // 5. Newsletter Signup Verification & Feedback
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
  // 6. In-House Designing R&D Interactive Valve Selector Control
  // ==========================================================================
  // Valve Selector Tabs (Wafer / Lug / Flanged)
  const valveTabBtns = document.querySelectorAll(".valve-tab-btn");
  const valveRenderImg = document.getElementById("valve-render-img");
  const valveRenderTitle = document.getElementById("valve-render-title");
  const valveRenderDesc = document.getElementById("valve-render-desc");

  if (valveTabBtns.length > 0) {
    // Valve types data map
    const valveData = {
      wafer: {
        src: "images/Wafer Design Butterfly Valves.jpg",
        title: "Wafer Design Butterfly Valve",
        desc: "Resilient seated series 100, optimized for compact, low-weight, and bubble-tight flow isolation."
      },
      lug: {
        src: "images/lug_design.jpg",
        title: "Lug Design Butterfly Valve",
        desc: "Resilient seated series 200, features threaded lugs for independent piping segment shutoff and dead-end services."
      },
      flange: {
        src: "images/double_flange.jpg",
        title: "Double Flange Butterfly Valve",
        desc: "Heavy-duty double flanged series 300, engineered for high-pressure municipal water works and industrial cooling mains."
      }
    };

    valveTabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-valve");
        if (!valveData[type] || !valveRenderImg) return;

        // Update active tab button styling
        valveTabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // Trigger smooth fade transition
        valveRenderImg.classList.add("fade-out");

        setTimeout(() => {
          // Swap content
          valveRenderImg.src = valveData[type].src;
          valveRenderImg.alt = `Completed 3D Render of ${valveData[type].title}`;
          if (valveRenderTitle) valveRenderTitle.textContent = valveData[type].title;
          if (valveRenderDesc) valveRenderDesc.textContent = valveData[type].desc;

          // Fade back in
          valveRenderImg.classList.remove("fade-out");
          valveRenderImg.classList.add("fade-in");
          
          // Remove class after transition completes
          setTimeout(() => {
            valveRenderImg.classList.remove("fade-in");
          }, 300);
        }, 250);
      });
    });
  }
});
