// Post Event Modal functionality
function initPostEventModal() {
  const postEventBtn = document.getElementById("postEventBtn");
  const postEventModal = document.getElementById("postEventModal");
  const closeModal = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const eventForm = document.getElementById("eventForm");
  const eventImage = document.getElementById("eventImage");
  const imagePreview = document.getElementById("imagePreview");

  // --- NEW: Get elements for the success modal ---
  const successModal = document.getElementById("successPostModal");
  const successOkBtn = document.getElementById("successOkBtn");

  // Show modal when post button is clicked
  if (postEventBtn) {
    postEventBtn.addEventListener("click", function () {
      postEventModal.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    });
  }

  // Hide modal functions
  function hideModal() {
    postEventModal.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
    resetForm();
  }

  // --- NEW: Function to hide the success modal ---
  function hideSuccessModal() {
    if (successModal) {
      successModal.classList.remove("active");
    }
  }

  // Close modal when X button is clicked
  if (closeModal) {
    closeModal.addEventListener("click", hideModal);
  }

  // Close modal when Cancel button is clicked
  if (cancelBtn) {
    cancelBtn.addEventListener("click", hideModal);
  }

  // Close modal when clicking outside the modal content
  postEventModal.addEventListener("click", function (e) {
    if (e.target === postEventModal) {
      hideModal();
    }
  });

  // --- NEW: Event listeners for the success modal ---
  if (successModal) {
    successModal.addEventListener("click", function (e) {
      if (e.target === successModal) {
        hideSuccessModal();
      }
    });
  }
  if (successOkBtn) {
    successOkBtn.addEventListener("click", hideSuccessModal);
  }

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (postEventModal.classList.contains("active")) {
        hideModal();
      }
      if (successModal && successModal.classList.contains("active")) {
        hideSuccessModal();
      }
    }
  });

  // Image preview functionality
  if (eventImage) {
    eventImage.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          imagePreview.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Form submission
  if (eventForm) {
    eventForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin mr-2"></i>Posting...';

      try {
        let uploadedImageUrl = "";

        // 1. If there's an image, upload it first
        const imageFile = document.getElementById("eventImage").files[0];
        if (imageFile) {
          const imgFormData = new FormData();
          imgFormData.append("file", imageFile); // backend upload endpoint expects 'image'

          const uploadResponse = await fetch(
            "https://sport-hub.eunglyzhia.social/api/v1/upload",
            {
              method: "POST",
              body: imgFormData,
            }
          );

          if (!uploadResponse.ok) {
            throw new Error(`Image upload failed: ${uploadResponse.status}`);
          }

          const uploadData = await uploadResponse.json();
          console.log(uploadData.uri);
          uploadedImageUrl = uploadData?.uri; // adjust if your API returns a different field
        }

        // 2. Prepare JSON payload for event creation
        const payload = {
          name: document.getElementById("eventTitle").value,
          description: document.getElementById("eventDescription").value,
          date: document.getElementById("eventDate").value,
          locationName: document.getElementById("eventLocation").value,
          latitude: parseFloat(document.getElementById("eventLatitude").value),
          longitude: parseFloat(
            document.getElementById("eventLongitude").value
          ),
          categoryName: document.getElementById("eventCategory").value,
          imageUrls: uploadedImageUrl ? [uploadedImageUrl] : [],
        };

        // 3. Send JSON event data
        const response = await fetch(
          "https://sport-hub.eunglyzhia.social/api/v1/events",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: "Could not parse error response.",
          }));
          throw new Error(
            `API Error: ${response.status} - ${
              errorData.message || "Failed to post event"
            }`
          );
        }

        // --- Success ---
        hideModal(); // Hide the form modal
        if (successModal) {
          successModal.classList.add("active"); // Show the success pop-up
        } else {
          alert("Event posted successfully!"); // Fallback if modal isn't found
        }

        console.log("Refreshing event list after posting...");
        await fetchAndInitializeData();
      } catch (error) {
        console.error("Failed to submit event:", error);
        alert(`An error occurred while posting the event:\n${error.message}`);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // Reset form function
  function resetForm() {
    if (eventForm) {
      eventForm.reset();
    }
    if (imagePreview) {
      imagePreview.classList.add("hidden");
      imagePreview.src = "";
    }
  }
}
initPostEventModal();
