// Global state for the current event and related events
let currentEvent = null;
let favoriteEvents = new Set();
let relatedEventsData = [];

// Carousel state
let currentCarouselIndex = 0;
let isCarouselAnimating = false;
let carouselAutoSwap = null;
const CAROUSEL_INTERVAL = 5000; // 5 seconds for auto-swap
const eventsPerPage = 4; // Number of events visible at once

/**
 * Initializes the hamburger menu for mobile view.
 */
function initHamburgerMenu() {
  const menuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

/**
 * Formats a date string into a more readable English format.
 * @param {string} dateStr - The date string to format.
 * @returns {string} - The formatted date.
 */
function formatDateToEnglish(dateStr) {
  if (!dateStr) return "Date not available";
  const date = new Date(dateStr);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Loads the main event data from localStorage and updates the UI.
 */
function loadEventData() {
  const savedEventData = localStorage.getItem("selectedEvent");

  if (savedEventData) {
    currentEvent = JSON.parse(savedEventData);
  } else {
    console.warn("No event data found, using fallback data.");
    const container = document.getElementById("event-detail-container");
    if (container) {
      container.innerHTML = `
        <p class="text-center text-red-500">Could not load event details. Please go back and select an event.</p>
      `;
    }
    return;
  }

  // Update the page with the loaded event data
  updateEventDisplay();

  // Fetch comments using the event's UUID
  if (currentEvent && currentEvent.uuid) {
    fetchComments(currentEvent.uuid);
  } else {
    console.error("Cannot fetch comments: Event UUID is missing.");
    const commentsContainer = document.getElementById("commentsContainer");
    if (commentsContainer) {
      commentsContainer.innerHTML =
        '<p class="text-red-500">Could not load comments: Event ID missing.</p>';
    }
  }

  // Fetch related events
  fetchRelatedEvents();
}

/**
 * Fetches related events from the sports API.
 */
async function fetchRelatedEvents() {
  try {
    const response = await fetch(
      "https://sport-hub.eunglyzhia.social/api/v1/sports"
    );
    if (!response.ok)
      throw new Error(
        `Network response was not ok. Status: ${response.status}`
      );

    const sports = await response.json();

    if (Array.isArray(sports) && sports.length > 0) {
      // Filter out the current event and get a random selection of others
      relatedEventsData = sports
        .filter((sport) => sport.uuid !== currentEvent.uuid)
        .sort(() => 0.5 - Math.random())
        .slice(0, 12); // Get up to 12 related events for a smoother carousel

      initializeRelatedEventsCarousel();
      startCarouselAutoSwap();
    } else {
      displayNoRelatedEvents();
    }
  } catch (error) {
    console.error("Failed to fetch related events:", error);
    displayNoRelatedEvents();
  }
}

/**
 * Displays a message when no related events are available.
 */
function displayNoRelatedEvents() {
  const carousel = document.getElementById("relatedEventsCarousel");
  if (carousel) {
    carousel.innerHTML = `<div class="flex justify-center items-center w-full h-64">
      <p class="text-gray-500">No related events available.</p>
    </div>`;
  }

  // Hide navigation buttons if no events
  const prevBtn = document.getElementById("relatedPrevBtn");
  const nextBtn = document.getElementById("relatedNextBtn");
  if (prevBtn) prevBtn.style.display = "none";
  if (nextBtn) nextBtn.style.display = "none";
}

/**
 * Initializes the related events carousel.
 */
function initializeRelatedEventsCarousel() {
  if (relatedEventsData.length === 0) {
    displayNoRelatedEvents();
    return;
  }

  const carousel = document.getElementById("relatedEventsCarousel");
  if (!carousel) return;

  carousel.innerHTML = ""; // Clear previous content

  // Create cards for all events
  relatedEventsData.forEach((event, index) => {
    const eventCard = createRelatedEventCard(event, index);
    carousel.appendChild(eventCard);
  });

  // Update carousel display
  updateCarouselDisplay();

  // Show navigation buttons
  const prevBtn = document.getElementById("relatedPrevBtn");
  const nextBtn = document.getElementById("relatedNextBtn");
  if (prevBtn) prevBtn.style.display = "block";
  if (nextBtn) nextBtn.style.display = "block";

  // Create indicators
  createCarouselIndicators();
}

/**
 * Creates an HTML card for a related event.
 * @param {object} event - The event data.
 * @param {number} index - The index of the event.
 * @returns {HTMLElement} - The created card element.
 */
function createRelatedEventCard(event, index) {
  const card = document.createElement("article");
  card.className = "flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2";
  card.setAttribute("data-index", index);

  card.addEventListener("click", () => {
    navigateToEvent(event);
  });

  const imageUrl =
    event.imageUrls && event.imageUrls.length > 0
      ? event.imageUrls[0]
      : "https://placehold.co/320x200/3b82f6/ffffff?text=Event+Image";
  const eventDate = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString()
    : "No date";

  card.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-full transform hover:-translate-y-1 transition-transform duration-300 shadow-lg hover:shadow-xl">
      <figure class="h-48 overflow-hidden">
        <img src="${imageUrl}" alt="${event.name || "Related Event"}"
             class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
             onerror="this.onerror=null;this.src='https://placehold.co/320x200/3b82f6/ffffff?text=Image+Error';">
      </figure>
      <section class="p-4">
        <h4 class="text-lg font-bold mb-2 custom-text line-clamp-2">${
          event.name || "Untitled Event"
        }</h4>
        <time class="text-sm text-gray-500 dark:text-gray-400 mb-2 block">${eventDate}</time>
        <p class="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">${
          event.description
            ? event.description.substring(0, 100) + "..."
            : "No description."
        }</p>
      </section>
    </div>`;
  return card;
}

/**
 * Creates carousel indicators (dots).
 */
function createCarouselIndicators() {
  const indicatorsContainer = document.getElementById("relatedIndicators");
  if (!indicatorsContainer || relatedEventsData.length === 0) return;

  const totalPages = Math.ceil(relatedEventsData.length / eventsPerPage);
  indicatorsContainer.innerHTML = "";

  for (let i = 0; i < totalPages; i++) {
    const indicator = document.createElement("button");
    indicator.className = `w-2 h-2 rounded-full transition-all duration-300 ${
      i === currentCarouselIndex ? "bg-accent" : "bg-gray-300 dark:bg-gray-600"
    }`;
    indicator.addEventListener("click", () => goToCarouselPage(i));
    indicatorsContainer.appendChild(indicator);
  }
}

/**
 * Updates the carousel display position.
 */
function updateCarouselDisplay() {
  if (isCarouselAnimating) return;

  const carousel = document.getElementById("relatedEventsCarousel");
  if (!carousel || relatedEventsData.length === 0) return;

  const cardWidth = 100 / eventsPerPage; // Percentage width per card
  const translateX = -(currentCarouselIndex * cardWidth * eventsPerPage);

  carousel.style.transform = `translateX(${translateX}%)`;

  // Update indicators
  updateCarouselIndicators();
}

/**
 * Updates carousel indicators to show current page.
 */
function updateCarouselIndicators() {
  const indicators = document.querySelectorAll("#relatedIndicators button");
  indicators.forEach((indicator, index) => {
    if (index === currentCarouselIndex) {
      indicator.className =
        "w-2 h-2 rounded-full transition-all duration-300 bg-accent";
    } else {
      indicator.className =
        "w-2 h-2 rounded-full transition-all duration-300 bg-gray-300 dark:bg-gray-600";
    }
  });
}

/**
 * Goes to a specific carousel page.
 * @param {number} pageIndex - The page index to go to.
 */
function goToCarouselPage(pageIndex) {
  if (isCarouselAnimating) return;

  const totalPages = Math.ceil(relatedEventsData.length / eventsPerPage);
  if (pageIndex < 0 || pageIndex >= totalPages) return;

  currentCarouselIndex = pageIndex;
  updateCarouselDisplay();

  // Reset auto-swap timer
  stopCarouselAutoSwap();
  startCarouselAutoSwap();
}

/**
 * Moves carousel to the next page.
 */
function nextCarouselPage() {
  if (isCarouselAnimating || relatedEventsData.length === 0) return;

  const totalPages = Math.ceil(relatedEventsData.length / eventsPerPage);
  currentCarouselIndex = (currentCarouselIndex + 1) % totalPages;
  updateCarouselDisplay();
}

/**
 * Moves carousel to the previous page.
 */
function prevCarouselPage() {
  if (isCarouselAnimating || relatedEventsData.length === 0) return;

  const totalPages = Math.ceil(relatedEventsData.length / eventsPerPage);
  currentCarouselIndex =
    currentCarouselIndex === 0 ? totalPages - 1 : currentCarouselIndex - 1;
  updateCarouselDisplay();
}

/**
 * Starts the automatic carousel swapping.
 */
function startCarouselAutoSwap() {
  if (relatedEventsData.length <= eventsPerPage) return; // Don't auto-swap if all events fit in one page

  stopCarouselAutoSwap(); // Clear any existing interval
  carouselAutoSwap = setInterval(() => {
    nextCarouselPage();
  }, CAROUSEL_INTERVAL);
}

/**
 * Stops the automatic carousel swapping.
 */
function stopCarouselAutoSwap() {
  if (carouselAutoSwap) {
    clearInterval(carouselAutoSwap);
    carouselAutoSwap = null;
  }
}

/**
 * Navigates to a new event detail page from the related events section.
 * @param {object} event - The event to navigate to.
 */
function navigateToEvent(event) {
  const eventData = {
    id: event.id,
    uuid: event.uuid,
    title: event.name || "Untitled Event",
    description: event.description || "No description available.",
    date: event.createdAt || new Date().toISOString(),
    location: event.location || "Location not specified",
    category: event.category ? event.category.name : "Sports",
    image:
      event.imageUrls && event.imageUrls.length > 0
        ? event.imageUrls[0]
        : "https://placehold.co/800x400/3b82f6/ffffff?text=Event+Image",
    latitude: event.latitude,
    longitude: event.longitude,
  };

  localStorage.setItem("selectedEvent", JSON.stringify(eventData));
  window.location.reload(); // Reload the page to show the new event
}

/**
 * Updates the main event display elements with data.
 */
function updateEventDisplay() {
  if (!currentEvent) return;

  document.title = `${currentEvent.title || "Event"} - SportsHub`;

  const titleElement = document.getElementById("eventTitle");
  if (titleElement) {
    titleElement.textContent = currentEvent.title || "Event Title";
  }

  const descriptionElement = document.getElementById("eventDescription");
  if (descriptionElement) {
    descriptionElement.textContent =
      currentEvent.description || "No description available.";
  }

  const dateElement = document.getElementById("eventDate");
  if (dateElement) {
    dateElement.textContent = formatDateToEnglish(currentEvent.date);
  }

  const locationElement = document.getElementById("eventLocation");
  if (locationElement) {
    locationElement.textContent =
      currentEvent.location || "Location not specified";
  }

  const mapLocationElement = document.getElementById("mapLocation");
  if (mapLocationElement) {
    mapLocationElement.textContent =
      currentEvent.location || "Location not specified";
  }

  const categoryElement = document.getElementById("categoryBadge");
  if (categoryElement) {
    categoryElement.textContent = currentEvent.category || "Category";
  }

  const eventImage = document.getElementById("eventMainImage");
  if (eventImage) {
    eventImage.src =
      currentEvent.image ||
      "https://placehold.co/800x400/3b82f6/ffffff?text=Event+Image";
    eventImage.alt = currentEvent.title || "Event Image";
  }

  updateMapDisplay();
}

/**
 * Updates the embedded map source.
 */
function updateMapDisplay() {
  const locationMap = document.getElementById("locationMap");
  if (!locationMap) return;

  if (currentEvent.latitude && currentEvent.longitude) {
    locationMap.src = `https://maps.google.com/maps?q=${currentEvent.latitude},${currentEvent.longitude}&output=embed&z=15`;
  } else if (currentEvent.location) {
    locationMap.src = `https://maps.google.com/maps?q=${encodeURIComponent(
      currentEvent.location
    )}&output=embed&z=15`;
  } else {
    locationMap.src =
      "https://maps.google.com/maps?q=Phnom+Penh,+Cambodia&output=embed&z=12";
  }
}

/**
 * Fetches comments from the API for a specific event.
 * @param {string} eventUuid The UUID of the event to fetch comments for.
 */
async function fetchComments(eventUuid) {
  const commentsContainer = document.getElementById("commentsContainer");
  if (!commentsContainer) return;

  commentsContainer.innerHTML =
    '<p class="text-gray-500">Loading comments...</p>';

  try {
    const response = await fetch(
      `https://sport-hub.eunglyzhia.social/api/v1/comments/events/${eventUuid}`
    );
    if (!response.ok) {
      if (response.status === 404) {
        renderComments([]); // Render an empty state
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const comments = await response.json();
    renderComments(Array.isArray(comments) ? comments : []);
  } catch (error) {
    console.error("Could not fetch comments:", error);
    commentsContainer.innerHTML =
      '<p class="text-red-500">Failed to load comments.</p>';
  }
}

/**
 * Renders comments into the comments container.
 * @param {Array} commentsData The array of comment objects.
 */
function renderComments(commentsData) {
  const commentsContainer = document.getElementById("commentsContainer");
  if (!commentsContainer) return;

  if (!commentsData || commentsData.length === 0) {
    commentsContainer.innerHTML =
      '<p class="text-gray-500">Be the first to comment!</p>';
    return;
  }

  const sortedComments = [...commentsData].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  commentsContainer.innerHTML = sortedComments
    .map((comment) => {
      const commentTime = new Date(comment.createdAt).toLocaleString();
      const userName = comment.user?.name || "Anonymous";
      const userAvatarInitial = userName.substring(0, 2).toUpperCase();
      const commentContent = comment.comment || "No content";

      return `
        <section class="flex space-x-3">
          <figure class="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            <span>${userAvatarInitial}</span>
          </figure>
          <section class="flex-1">
            <section class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div class="flex items-center space-x-2 mb-1">
                <span class="font-medium custom-text">${userName}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">${commentTime}</span>
              </div>
              <p class="text-gray-700 dark:text-gray-300 text-sm">${commentContent}</p>
            </section>
          </section>
        </section>
      `;
    })
    .join("");
}

/**
 * Posts a new comment to the API.
 * @param {string} eventUuid - The UUID of the event.
 * @param {string} commentContent - The text of the comment.
 */
async function postComment(eventUuid, commentContent) {
  if (commentContent.trim() === "") {
    showNotification("Please enter a comment before posting.", "error");
    return;
  }

  const apiUrl = "https://sport-hub.eunglyzhia.social/api/v1/comments";
  const requestBody = {
    eventUuid: eventUuid,
    comment: commentContent,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to post comment: ${errorData.message || response.statusText}`
      );
    }

    showNotification("Comment posted successfully!", "success");
    fetchComments(eventUuid);
  } catch (error) {
    console.error("Error posting comment:", error);
    showNotification(error.message, "error");
  }
}

/**
 * Shows a temporary notification message.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', or 'info'.
 */
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";
  notification.className = `fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg z-50 text-white font-medium ${bgColor}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Post comment button
  const postCommentBtn = document.getElementById("postCommentBtn");
  if (postCommentBtn) {
    postCommentBtn.addEventListener("click", () => {
      const commentTextElement = document.getElementById("commentText");
      const commentContent = commentTextElement
        ? commentTextElement.value.trim()
        : "";

      if (commentContent && currentEvent && currentEvent.uuid) {
        postComment(currentEvent.uuid, commentContent);
        commentTextElement.value = "";
      } else if (!commentContent) {
        showNotification("Please write a comment first.", "error");
      } else {
        showNotification("Cannot post comment: Event ID is missing.", "error");
      }
    });
  }

  // Carousel navigation
  const prevBtn = document.getElementById("relatedPrevBtn");
  const nextBtn = document.getElementById("relatedNextBtn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevCarouselPage();
      // Reset auto-swap timer when user manually navigates
      stopCarouselAutoSwap();
      startCarouselAutoSwap();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextCarouselPage();
      // Reset auto-swap timer when user manually navigates
      stopCarouselAutoSwap();
      startCarouselAutoSwap();
    });
  }

  // Pause auto-swap on hover
  const carouselContainer = document.querySelector(".relative");
  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", stopCarouselAutoSwap);
    carouselContainer.addEventListener("mouseleave", startCarouselAutoSwap);
  }

  // Open map button
  const openMapBtn = document.getElementById("openMapBtn");
  if (openMapBtn) {
    openMapBtn.addEventListener("click", () => {
      if (currentEvent.latitude && currentEvent.longitude) {
        window.open(
          `https://maps.google.com/maps?q=${currentEvent.latitude},${currentEvent.longitude}`,
          "_blank"
        );
      } else if (currentEvent.location) {
        window.open(
          `https://maps.google.com/maps?q=${encodeURIComponent(
            currentEvent.location
          )}`,
          "_blank"
        );
      }
    });
  }
}

// --- Global Navigation Functions ---
function goBackToHome() {
  window.location.href = "../../index.html";
}

// Social sharing functions
function shareToFacebook() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(
    currentEvent?.title || "Check out this event!"
  );
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
    "_blank"
  );
}

function shareToTelegram() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(
    currentEvent?.title || "Check out this event!"
  );
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
}

function shareToInstagram() {
  // Instagram doesn't support direct URL sharing, so copy to clipboard instead
  copyEventLink();
  showNotification(
    "Link copied! You can paste it in your Instagram post or story.",
    "info"
  );
}

function copyEventLink() {
  navigator.clipboard
    .writeText(window.location.href)
    .then(() => {
      showNotification("Event link copied to clipboard!", "success");
    })
    .catch(() => {
      showNotification("Failed to copy link to clipboard.", "error");
    });
}

// --- Page Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initHamburgerMenu();
  loadEventData();
  setupEventListeners();
});

// Clean up on page unload
window.addEventListener("beforeunload", () => {
  stopCarouselAutoSwap();
});
