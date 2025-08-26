// Global variables for event data management
let eventsData = []; // Stores all events from API
let filteredEvents = []; // Stores currently displayed/filtered events
let favoriteEvents = new Set(); // Stores favorite event UUIDs
let showOnlyFavorites = false;
let currentDisplayCount = 6;
const LOAD_MORE_COUNT = 3;

// API Endpoints
const API_BASE_URL = "https://sport-hub.eunglyzhia.social/api/v1";
const EVENTS_API_URL = `${API_BASE_URL}/events`;
const CATEGORIES_API_URL = `${API_BASE_URL}/sport_categories`;

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
    };
    return date.toLocaleDateString("en-US", options);
}

/**
 * Loads favorite event UUIDs from local storage.
 */
function loadFavorites() {
    const storedFavorites = localStorage.getItem("favoriteEventUUIDs");
    if (storedFavorites) {
        const favoriteUUIDs = JSON.parse(storedFavorites);
        favoriteEvents = new Set(favoriteUUIDs);
        updateFavoriteCount();
    }
}

/**
 * Maps an event object from the API to a standardized card format.
 * @param {object} event - An event object from the API.
 * @returns {object} - An object formatted for display.
 */
function mapEventToCardData(event) {
    return {
        id: event.id,
        uuid: event.uuid,
        title: event.name || "Untitled Event",
        description: event.description || "No description available",
        date: event.createdAt,
        location: event.locationName || "Location not specified",
        latitude: event.latitude,
        longitude: event.longitude,
        category: event.category ?
            event.category.name.toLowerCase() : "uncategorized",
        categoryDisplay: event.category ? event.category.name : "Uncategorized",
        image: event.imageUrls && event.imageUrls.length > 0 ?
            event.imageUrls[0] : "https://placehold.co/800x400/3b82f6/ffffff?text=Event+Image",
    };
}

/**
 * Fetches events data from the API to initialize the page.
 */
async function fetchAndInitializeData() {
    const eventsContainer = document.getElementById("eventsContainer");
    eventsContainer.innerHTML = `<p class="col-span-3 text-center py-12 text-gray-500">Loading events...</p>`;

    try {
        const response = await fetch(EVENTS_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData = await response.json();

        eventsData = apiData.map(mapEventToCardData);
        filteredEvents = [...eventsData];

        renderCards();
    } catch (error) {
        console.error("Failed to fetch events:", error);

        // Hide the main content sections
        const eventsSection = document.getElementById("events-section");
        const seeMoreBtn = document.getElementById("seeMoreBtn");
        if (eventsSection) eventsSection.style.display = "none";
        if (seeMoreBtn) seeMoreBtn.style.display = "none";

        // Display the 404 error animation
        const errorContainer = document.getElementById("error-404-container");
        if (errorContainer) {
            errorContainer.classList.remove("hidden");
            errorContainer.classList.add("flex");
        }
    }
}

/**
 * Fetches sport categories and populates the filter dropdown.
 */
async function populateCategoryFilter() {
    const categoryFilter = document.getElementById("categoryFilter");
    try {
        const response = await fetch(CATEGORIES_API_URL);
        if (!response.ok) throw new Error("Failed to fetch categories");

        const categories = await response.json();
        const uniqueCategories = new Set();

        let optionsHTML = '<option value="">All Categories</option>';

        categories.forEach((category) => {
            const categoryName = category.name;
            if (!uniqueCategories.has(categoryName.toLowerCase())) {
                uniqueCategories.add(categoryName.toLowerCase());
                optionsHTML += `<option value="${categoryName.toLowerCase()}">${categoryName}</option>`;
            }
        });

        categoryFilter.innerHTML = optionsHTML;
    } catch (error) {
        console.error("Failed to fetch sport categories:", error);
        categoryFilter.innerHTML =
            '<option value="">Categories unavailable</option>';
        categoryFilter.disabled = true;
    }
}

/**
 * Creates the HTML for a single event card.
 * @param {object} eventItem - The event data object.
 * @returns {string} - The HTML string for the card.
 */
function createEventCard(eventItem) {
    const isFavorite = favoriteEvents.has(eventItem.uuid);
    const dateElement = eventItem.date ?
        `<div class="flex items-center text-gray-500 text-sm mb-2">
            <i class="fas fa-calendar-alt mr-2"></i>
            <span>${formatDateToEnglish(eventItem.date)}</span>
        </div>` :
        "";

    return `
      <article class="bg-white rounded-lg border border-gray-200 overflow-hidden transition-transform duration-300 hover:-translate-y-1 cursor-pointer" data-category="${
        eventItem.category
      }" data-event-uuid="${eventItem.uuid}" onclick="navigateToEventDetail('${
    eventItem.uuid
  }')">
          <figure class="aspect-video relative">
              <div class="absolute top-3 left-3 bg-accent text-white text-xs font-semibold px-2 py-1 rounded">${
                eventItem.categoryDisplay
              }</div>
              <img src="${eventItem.image}" alt="${
    eventItem.title
  }" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/800x400/3b82f6/ffffff?text=Image+Error';">
              <div class="absolute top-3 right-3 heart-container rounded-full w-8 h-8 flex items-center justify-center">
                  <i class="fas fa-heart ${
                    isFavorite ? "text-red-500" : "text-gray-400"
                  } cursor-pointer transition-colors" onclick="event.stopPropagation(); toggleFavoriteHeart(this, '${
    eventItem.uuid
  }')"></i>
              </div>
          </figure>
          <div class="p-4">
              <h3 class="font-semibold custom-text mb-2 line-clamp-2" title="${
                eventItem.title
              }">${eventItem.title}</h3>
              ${dateElement}
              <address class="flex items-center text-gray-500 text-sm not-italic mb-2">
                  <i class="fas fa-map-marker-alt mr-2"></i>
                  <span class="truncate">${eventItem.location}</span>
              </address>
              <p class="text-gray-600 text-sm line-clamp-3">${
                eventItem.description
              }</p>
          </div>
      </article>
    `;
}

/**
 * Navigates to the event detail page with the selected event's data.
 * @param {string} eventUuid - The UUID of the event to display.
 */
function navigateToEventDetail(eventUuid) {
    const selectedEvent = eventsData.find((event) => event.uuid === eventUuid);
    if (selectedEvent) {
        // *** FIX: Ensure all necessary data, including uuid, is passed ***
        const eventForDetail = {
            id: selectedEvent.id,
            uuid: selectedEvent.uuid,
            title: selectedEvent.title,
            description: selectedEvent.description,
            date: selectedEvent.date,
            location: selectedEvent.location,
            latitude: selectedEvent.latitude,
            longitude: selectedEvent.longitude,
            category: selectedEvent.categoryDisplay,
            image: selectedEvent.image,
            locationLink: `https://maps.google.com/maps?q=${selectedEvent.latitude},${selectedEvent.longitude}&output=embed&z=15`,
        };

        localStorage.setItem("selectedEvent", JSON.stringify(eventForDetail));
        window.location.href = "./../html/detail.html";
    } else {
        console.error("Event not found with UUID:", eventUuid);
        alert("Sorry, event details could not be loaded.");
    }
}

/**
 * Toggles the favorite status of an event.
 * @param {HTMLElement} heartElement - The heart icon element.
 * @param {string} eventUuid - The UUID of the event.
 */
function toggleFavoriteHeart(heartElement, eventUuid) {
    if (favoriteEvents.has(eventUuid)) {
        favoriteEvents.delete(eventUuid);
        heartElement.classList.remove("text-red-500");
        heartElement.classList.add("text-gray-400");
    } else {
        favoriteEvents.add(eventUuid);
        heartElement.classList.add("text-red-500");
        heartElement.classList.remove("text-gray-400");
    }

    localStorage.setItem(
        "favoriteEventUUIDs",
        JSON.stringify(Array.from(favoriteEvents))
    );
    updateFavoriteCount();

    if (showOnlyFavorites) {
        applyFilters();
    }
}

/**
 * Updates the favorite count display in the header.
 */
function updateFavoriteCount() {
    const favoriteCount = document.getElementById("favoriteCount");
    const count = favoriteEvents.size;
    if (count > 0) {
        favoriteCount.textContent = count;
        favoriteCount.classList.remove("hidden");
    } else {
        favoriteCount.classList.add("hidden");
    }
}

/**
 * Renders the event cards into the container.
 */
function renderCards() {
    const eventsContainer = document.getElementById("eventsContainer");
    const seeMoreBtn = document.getElementById("seeMoreBtn");

    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = `
        <div class="col-span-3 text-center py-12">
            <i class="fas fa-search text-gray-400 text-4xl mb-4"></i>
            <p class="text-gray-500 text-lg">No events found matching your criteria.</p>
        </div>`;
        seeMoreBtn.classList.add("hidden");
        return;
    }

    const cardsToShow = filteredEvents.slice(0, currentDisplayCount);
    eventsContainer.innerHTML = cardsToShow.map(createEventCard).join("");

    if (currentDisplayCount >= filteredEvents.length) {
        seeMoreBtn.classList.add("hidden");
    } else {
        seeMoreBtn.classList.remove("hidden");
    }
}

/**
 * Applies the current filters (category, search, favorites) to the event list.
 */
function applyFilters() {
    const selectedCategory = document
        .getElementById("categoryFilter")
        .value.toLowerCase();
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();

    filteredEvents = eventsData.filter((event) => {
        const favoriteMatch = !showOnlyFavorites || favoriteEvents.has(event.uuid);
        const categoryMatch = !selectedCategory || event.category === selectedCategory;
        const searchMatch = !searchTerm ||
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm);
        return favoriteMatch && categoryMatch && searchMatch;
    });

    currentDisplayCount = 6; // Reset display count on new filter
    renderCards();
}

/**
 * Initializes filter event listeners.
 */
function initFilters() {
    document
        .getElementById("categoryFilter")
        .addEventListener("change", applyFilters);
    document
        .getElementById("searchInput")
        .addEventListener("input", applyFilters);
    document.getElementById("favoriteBtn").addEventListener("click", () => {
        showOnlyFavorites = !showOnlyFavorites;
        const favoriteIcon = document.getElementById("favoriteIcon");
        favoriteIcon.classList.toggle("text-red-500", showOnlyFavorites);
        applyFilters();
    });
}

/**
 * Initializes the "See More" button functionality.
 */
function initSeeMore() {
    document.getElementById("seeMoreBtn").addEventListener("click", () => {
        currentDisplayCount += LOAD_MORE_COUNT;
        renderCards();
    });
}

/**
 * Initialize modern hero slider with smooth transitions
 */
function initModernHeroSlider() {
    const slides = document.querySelectorAll(".slide");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");
    const dotsContainer = document.querySelector(".slider-dots");
    const heroSlider = document.querySelector(".hero-slider");

    if (!slides.length || !prevBtn || !nextBtn || !dotsContainer || !heroSlider) {
        return;
    }

    let currentIndex = 0;
    const slideCount = slides.length;
    let autoPlayInterval;

    slides.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        dot.addEventListener("click", () => {
            goToSlide(i);
            resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll(".dot");

    function goToSlide(index) {
        currentIndex = (index + slideCount) % slideCount;
        slides.forEach((slide, i) =>
            slide.classList.toggle("active", i === currentIndex)
        );
        dots.forEach((dot, i) =>
            dot.classList.toggle("active", i === currentIndex)
        );
    }

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    const startAutoPlay = () => (autoPlayInterval = setInterval(nextSlide, 5000));
    const stopAutoPlay = () => clearInterval(autoPlayInterval);
    const resetAutoPlay = () => {
        stopAutoPlay();
        startAutoPlay();
    };

    nextBtn.addEventListener("click", () => {
        nextSlide();
        resetAutoPlay();
    });
    prevBtn.addEventListener("click", () => {
        prevSlide();
        resetAutoPlay();
    });
    heroSlider.addEventListener("mouseenter", stopAutoPlay);
    heroSlider.addEventListener("mouseleave", startAutoPlay);

    goToSlide(0);
    startAutoPlay();
}

// --- DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", function() {
    initHamburgerMenu();
    loadFavorites();
    populateCategoryFilter();
    fetchAndInitializeData();
    initFilters();
    initSeeMore();
    initModernHeroSlider();
});