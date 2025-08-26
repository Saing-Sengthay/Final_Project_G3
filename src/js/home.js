// Wait for the HTML document to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    // The API endpoint URL
    const apiUrl = "https://cors-anywhere.herokuapp.com/https://sport-hub.eunglyzhia.social/api/v1/sports";

    // Get the container element from the HTML where the sport cards will be displayed
    const sportsContainer = document.getElementById("sports-container");
    const newEventsContainer = document.getElementById("new-events-container");

    // Pagination variables
    let allSports = [];
    let currentPage = 0;
    const sportsPerPage = 8;

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
     * Initialize modern hero slider with smooth transitions
     */
    function initModernHeroSlider() {
        const slides = document.querySelectorAll(".slide");
        const prevBtn = document.querySelector(".prev");
        const nextBtn = document.querySelector(".next");
        const dotsContainer = document.querySelector(".slider-dots");
        const heroSlider = document.querySelector(".hero-slider");

        if (!slides.length ||
            !prevBtn ||
            !nextBtn ||
            !dotsContainer ||
            !heroSlider
        ) {
            console.error(
                "Slider component not found. Please check your HTML structure."
            );
            return;
        }

        let currentIndex = 0;
        const slideCount = slides.length;
        let autoPlayInterval;

        // --- Create Navigation Dots ---
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

        // --- Core Function to Change Slide ---
        function goToSlide(index) {
            // Clamp index
            if (index < 0) index = slideCount - 1;
            if (index >= slideCount) index = 0;

            currentIndex = index;

            // Update slides
            slides.forEach((slide, i) => {
                slide.classList.remove("active");
                if (i === currentIndex) {
                    slide.classList.add("active");
                    // Refresh AOS for elements in the new active slide
                    const aosElements = slide.querySelectorAll("[data-aos]");
                    aosElements.forEach((el) => {
                        el.classList.remove("aos-animate");
                    });
                    setTimeout(() => {
                        aosElements.forEach((el) => {
                            el.classList.add("aos-animate");
                        });
                    }, 50);
                }
            });

            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === currentIndex);
            });
        }

        // --- Navigation Functions ---
        const nextSlide = () => goToSlide(currentIndex + 1);
        const prevSlide = () => goToSlide(currentIndex - 1);

        // --- Auto-Play Functionality ---
        const startAutoPlay = () =>
            (autoPlayInterval = setInterval(nextSlide, 5000));
        const stopAutoPlay = () => clearInterval(autoPlayInterval);
        const resetAutoPlay = () => {
            stopAutoPlay();
            startAutoPlay();
        };

        // --- Event Listeners ---
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

        // --- Initialize Slider ---
        goToSlide(0);
        startAutoPlay();
    }

    /**
     * Fetches sports data from the API and populates the page with sport cards.
     */
    async function fetchSportsData() {
        // Display a loading message while fetching data
        if (sportsContainer) {
            sportsContainer.innerHTML =
                '<p class="text-center col-span-full text-gray-500 custom-text">Loading sports...</p>';
        }
        if (newEventsContainer) {
            newEventsContainer.innerHTML =
                '<p class="text-center text-gray-500 custom-text">Loading new events...</p>';
        }

        try {
            // Fetch data from the API using the provided URL
            const response = await fetch(apiUrl);

            // Check if the HTTP request was successful (status code 200-299)
            if (!response.ok) {
                // If not successful, throw an error to be caught by the catch block
                throw new Error(
                    `Network response was not ok. Status: ${response.status}`
                );
            }

            // Parse the JSON data from the response body
            const sports = await response.json();

            // Check if the API returned an array and it contains data
            if (Array.isArray(sports) && sports.length > 0) {
                // Store all sports for pagination
                allSports = sports;

                // Initialize new events with some items
                initNewEvents(sports.slice(0, 5)); // Show 5 new events initially

                // Display first page of sports cards
                displaySportsPage(0);
            } else {
                // If the array is empty, display a "not found" message
                if (sportsContainer) {
                    sportsContainer.innerHTML =
                        '<p class="text-center col-span-full">No sports found.</p>';
                }
            }
        } catch (error) {
            // If any error occurs during the fetch operation, log it to the console
            console.error("There was a problem with the fetch operation:", error);

            // Hide the main content sections
            const newEventsSection = document.getElementById("new-events-section");
            const popularSportsSection = document.getElementById(
                "popular-sports-section"
            );
            const seeMoreNav =
                document.getElementById("popular-see-more").parentElement;

            if (newEventsSection) newEventsSection.style.display = "none";
            if (popularSportsSection) popularSportsSection.style.display = "none";
            if (seeMoreNav) seeMoreNav.style.display = "none";

            // Display the 404 error animation
            const errorContainer = document.getElementById("error-404-container");
            if (errorContainer) {
                errorContainer.classList.remove("hidden");
                errorContainer.classList.add("flex");
            }
        }
    }

    /**
     * Display sports for a specific page
     */
    function displaySportsPage(page) {
        const startIndex = page * sportsPerPage;
        const endIndex = startIndex + sportsPerPage;
        const sportsToShow = allSports.slice(startIndex, endIndex);

        // Clear the container only on the first page load
        if (page === 0 && sportsContainer) {
            sportsContainer.innerHTML = "";
        }

        // Add sports cards for this page
        sportsToShow.forEach((sport) => {
            createSportCard(sport);
        });

        // Update see more button visibility
        updateSeeMoreButton();
    }

    /**
     * Update see more button state
     */
    function updateSeeMoreButton() {
        const seeMoreBtn = document.getElementById("popular-see-more");
        if (!seeMoreBtn) return;

        const currentlyDisplayed = sportsContainer.children.length;
        if (currentlyDisplayed >= allSports.length) {
            seeMoreBtn.style.display = "none";
        } else {
            seeMoreBtn.style.display = "inline-block";
        }
    }

    /**
     * Navigate to detail page with event data
     */
    function navigateToDetail(sport) {
        // Prepare event data for detail page
        const eventData = {
            id: sport.id || Date.now(),
            uuid: sport.uuid,
            title: sport.name || "Untitled Event",
            description: sport.description || "No description available for this event.",
            date: sport.createdAt || new Date().toISOString(),
            location: sport.location || "Location not specified",
            category: sport.category ? sport.category.name : "Sports",
            image: sport.imageUrls && sport.imageUrls.length > 0 ?
                sport.imageUrls[0] : "https://placehold.co/800x400/3b82f6/ffffff?text=Event+Image",
            latitude: sport.latitude || null,
            longitude: sport.longitude || null,
            locationLink: sport.locationLink || null,
        };

        // Save event data to localStorage
        localStorage.setItem("selectedEvent", JSON.stringify(eventData));

        // Navigate to detail page
        window.location.href = "./src/html/detail.html";
    }

    /**
     * Creates an HTML card for a single sport and appends it to the container.
     * @param {object} sport - The sport object containing details like name, description, and imageUrls.
     */
    function createSportCard(sport) {
        if (!sportsContainer) return;

        // Create the main <article> element for the card
        const card = document.createElement("article");
        card.className =
            "bg-white rounded-lg border border-gray-200 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 max-w-sm w-full cursor-pointer";

        // Add click event to navigate to detail page
        card.addEventListener("click", () => {
            navigateToDetail(sport);
        });

        const imageUrl =
            sport.imageUrls && sport.imageUrls.length > 0 ?
            sport.imageUrls[0] :
            "https://placehold.co/600x400/f0f0f0/ccc?text=No+Image";

        card.innerHTML = `
        <figure class="h-48 overflow-hidden">
            <img src="${imageUrl}" alt="${
      sport.name || "Sport image"
    }" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onerror="this.onerror=null;this.src='https://placehold.co/600x400/f0f0f0/ccc?text=Image+Error';">
        </figure>
        <section class="p-4">
            <h3 class="text-lg font-bold mb-2 custom-text truncate" title="${
              sport.name || "Untitled Sport"
            }">${sport.name || "Untitled Sport"}</h3>
            <p class="text-sm text-gray-600 line-clamp-3">${
              sport.description
                ? sport.description
                : "No description available."
            }</p>
        </section>
    `;

        // Append the completed card to the main container on the webpage
        sportsContainer.appendChild(card);
    }

    /**
     * Initialize new events section
     */
    function initNewEvents(eventsData) {
        if (!newEventsContainer || !eventsData.length) {
            if (newEventsContainer) {
                newEventsContainer.innerHTML =
                    '<p class="text-center text-gray-500">No new events available.</p>';
            }
            return;
        }

        let currentEventIndex = 0;
        let eventInterval;

        // Clear existing content
        newEventsContainer.innerHTML = "";

        eventsData.forEach((event, index) => {
            const eventElement = document.createElement("article");
            // Use flexbox for layout and manage visibility with a custom class
            eventElement.className =
                "new-event-card w-full flex-shrink-0 cursor-pointer";
            if (index !== 0) {
                eventElement.classList.add("hidden");
            }

            // Add click event to navigate to detail page
            eventElement.addEventListener("click", () => {
                navigateToDetail(event);
            });

            const imageUrl =
                event.imageUrls && event.imageUrls.length > 0 ?
                event.imageUrls[0] :
                "https://placehold.co/400x300/3b82f6/ffffff?text=Event+Image";
            const eventDate = event.createdAt ?
                new Date(event.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }) :
                "No date";

            eventElement.innerHTML = `
          <section class="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-6 items-stretch w-full h-auto md:h-[350px] transition-shadow duration-300">
              <figure class="md:w-2/5 w-full h-64 md:h-full">
                  <img src="${imageUrl}" alt="${event.name || "Event"}" 
                       class="rounded-lg w-full h-full object-cover"
                       onerror="this.onerror=null;this.src='https://placehold.co/400x300/3b82f6/ffffff?text=Image+Error';">
              </figure>
              <section class="md:w-3/5 w-full flex flex-col justify-center">
                  <h3 class="text-xl font-bold lg:text-2xl my-2 leading-tight custom-text">${
                    event.name || "Untitled Event"
                  }</h3>
                  <time class="text-gray-500 text-sm mb-4 english-text">${eventDate}</time>
                  <p class="text-gray-600 leading-relaxed text-base custom-text flex-1 overflow-hidden line-clamp-4">${
                    event.description || "No description available."
                  }</p>
              </section>
          </section>
      `;

            newEventsContainer.appendChild(eventElement);
        });

        // Make the container a flex container
        newEventsContainer.classList.add(
            "flex",
            "transition-transform",
            "duration-500",
            "ease-in-out"
        );

        // Function to show a specific event
        function showNewEvent(index) {
            const events = document.querySelectorAll(".new-event-card");
            if (events.length === 0) return;

            // Hide all cards
            events.forEach((card) => card.classList.add("hidden"));

            // Show the target card
            events[index].classList.remove("hidden");
            currentEventIndex = index;
        }

        // Auto-rotation for events
        function startEventRotation() {
            if (eventsData.length > 1) {
                eventInterval = setInterval(() => {
                    const nextIndex = (currentEventIndex + 1) % eventsData.length;
                    showNewEvent(nextIndex);
                }, 8000);
            }
        }

        // Event listeners for navigation buttons
        const newEventsPrevBtn = document.getElementById("new-events-prev");
        const newEventsNextBtn = document.getElementById("new-events-next");

        if (newEventsPrevBtn && newEventsNextBtn) {
            newEventsPrevBtn.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent event card click
                clearInterval(eventInterval);
                const prevIndex =
                    (currentEventIndex - 1 + eventsData.length) % eventsData.length;
                showNewEvent(prevIndex);
                startEventRotation();
            });

            newEventsNextBtn.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent event card click
                clearInterval(eventInterval);
                const nextIndex = (currentEventIndex + 1) % eventsData.length;
                showNewEvent(nextIndex);
                startEventRotation();
            });
        }

        // Start the auto-rotation
        startEventRotation();
    }

    // Event listener for see more button
    const seeMoreBtn = document.getElementById("popular-see-more");
    if (seeMoreBtn) {
        seeMoreBtn.addEventListener("click", () => {
            currentPage++;
            displaySportsPage(currentPage);
        });
    }

    // Initialize hamburger menu
    initHamburgerMenu();

    // Initialize modern hero slider
    initModernHeroSlider();

    // Call the main function to start the process of fetching and displaying the sports data
    fetchSportsData();
});