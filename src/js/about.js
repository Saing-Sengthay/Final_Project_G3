// Initialize AOS
AOS.init({
    once: true, // Whether animation should happen only once - while scrolling down
    mirror: false, // Whether elements should animate out while scrolling past them
});

// Featured mentors data with only Facebook and GitHub
let featuredMentors = [{
        name: "Mr. Kim Chansokpheng",
        role: "Mentor",
        image: "../../image/photo/Teacher2.jpg",
        description: "Learning from others is my favorite.",
        socialLinks: [{
                platform: "facebook",
                url: "https://www.facebook.com/share/19vE4S9jre/?mibextid=wwXIfr",
                icon: "fab fa-facebook-f",
            },
            {
                platform: "github",
                url: "https://github.com/sokpheng001",
                icon: "fab fa-github",
            },
        ],
    },
    {
        name: "Ms. Eung Lyzhia",
        role: "Mentor",
        image: "../../image/photo//Teacher1.jpg",
        description: "Every single step, challenges make him stronger...",
        socialLinks: [{
                platform: "facebook",
                url: " https://www.facebook.com/share/153E3fLo6W/?mibextid=wwXIfr",
                icon: "fab fa-facebook-f",
            },
            {
                platform: "github",
                url: "https://github.com/lyzhiaa",
                icon: "fab fa-github",
            },
        ],
    },
];

// Team members data with only Facebook and GitHub
let members = [{
        name: "Tak Sreytim",
        role: "Team Leader",
        image: "../../image/photo/Sreytim.jpg",

        socialLinks: [{
                platform: "facebook",
                url: "https://www.facebook.com/share/1Cps1QHR8R/?mibextid=wwXIfr",
                icon: "fab fa-facebook-f",
            },
            {
                platform: "github",
                url: "https://github.com/sreytim",
                icon: "fab fa-github",
            },
        ],
    },
    {
        name: "So Sampoleu",
        role: "Sub Leader",
        image: "../../image/photo/Ponlue.jpg",
        socialLinks: [{
                platform: "facebook",
                url: "https://www.facebook.com/share/1ApxsYhmPm/?mibextid=wwXIfr",
                icon: "fab fa-facebook-f",
            },
            {
                platform: "github",
                url: "https://github.com/SoSamponleu",
                icon: "fab fa-github",
            },
        ],
    },
    {
        name: "Dy Chandara",
        role: "Member",
        image: "../../image/photo/Dara.jpg",
        socialLinks: [{
                platform: "facebook",
                url: " https://www.facebook.com/share/15zsfeaFY5/",
                icon: "fab fa-facebook-f",
            },
            {
                platform: "github",
                url: "https://github.com/DyChandara",
                icon: "fab fa-github",
            },
        ],
    },
    {
        name: "Chhorn sengleang",
        role: "Member",
        image: "../../image/photo/Leng.jpg",
        socialLinks: [{
                platform: "facebook",
                url: "https://www.facebook.com/share/1BJBEwNune/?mibextid=wwXIfr",
                icon: "fab fa-facebook-f",
            },
            {
                platform: "github",
                url: "https://github.com/seavleng",
                icon: "fab fa-github",
            },
        ],
    },
    {
        name: "Dy Riya",
        role: "Member",
        image: "../../image/photo/Riya.jpg",
        socialLinks: [{
                platform: "facebook",
                url: "https://www.facebook.com/share/15sjY61YM1/?mibextid=wwXIfr",
                icon: "fab fa-facebook-f",
            },
            {
                platform: "github",
                url: " https://github.com/Dyriya",
                icon: "fab fa-github",
            },
        ],
    },
    {
        name: "Saing Senthay",
        role: "Member",
        image: "../../image/photo/Thay.jpg",
        socialLinks: [{
                platform: "facebook",
                url: "https://www.facebook.com/share/1APDaKJms6/",
                icon: "fab fa-facebook-f",
            },
            {
                platform: "github",
                url: "https://github.com/Saing-Sengthay",
                icon: "fab fa-github",
            },
        ],
    },
    {
        name: "Oeurn Selachhari",
        role: "Member",
        image: "../../image/photo/Chhari.jpg",
        socialLinks: [{
                platform: "facebook",
                url: "https://www.facebook.com/share/19JtDEfRcB/?mibextid=wwXIfr",
                icon: "fab fa-facebook-f",
            },
            {
                platform: "github",
                url: "https://github.com/OeurnSelaChhari",
                icon: "fab fa-github",
            },
        ],
    },
];

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

    if (!slides.length || !prevBtn || !nextBtn || !dotsContainer || !heroSlider) {
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
    const startAutoPlay = () => (autoPlayInterval = setInterval(nextSlide, 5000));
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

// Function to render featured mentors
function renderFeaturedMentors() {
    const featuredMentorsContainer = document.getElementById("featuredMentors");
    if (!featuredMentorsContainer) return; // Exit if element not found
    featuredMentorsContainer.innerHTML = "";

    featuredMentors.forEach((mentor, index) => {
                const mentorCard = document.createElement("div");
                // Add AOS attributes here
                mentorCard.setAttribute("data-aos", "fade-up");
                mentorCard.setAttribute("data-aos-delay", index * 100);
                mentorCard.className =
                    "bg-white rounded-xl p-6 border border-gray-200 transition-shadow";

                const socialLinksHTML = mentor.socialLinks
                    .map(
                        (social) =>
                        `<a href="${social.url}" class="text-[#000249] hover:text-blue-600 transition-colors" target="_blank" rel="noopener noreferrer">
                <i class="${social.icon} text-lg"></i>
            </a>`
                    )
                    .join("");

                mentorCard.innerHTML = `
            <div class="text-center">
                <div class="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
                    ${
                      mentor.image
                        ? `<img src="${mentor.image}" alt="${mentor.name}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/96x96/cccccc/ffffff?text=Mentor'; this.nextElementSibling.style.display='block';">
                         <span class="w-full h-full bg-gradient-to-b from-gray-400 to-[#000249] hidden"></span>`
                        : `<span class="w-full h-full bg-gradient-to-b from-gray-400 to-[#000249]"></span>`
                    }
                </div>
                <h3 class="font-bold text-[#000249] text-base mb-2">${
                  mentor.name
                }</h3>
                <p class="text-blue-600 font-semibold text-sm mb-4">${
                  mentor.role
                }</p>
                <div class="flex justify-center space-x-4">
                    ${socialLinksHTML}
                </div>
            </div>
        `;
    featuredMentorsContainer.appendChild(mentorCard);
  });
}

// Function to render team members in 3-4 layout
function renderMembers() {
  const membersRow1 = document.getElementById("membersRow1");
  const membersRow2 = document.getElementById("membersRow2");

  if (!membersRow1 || !membersRow2) return; // Exit if elements not found

  // Clear both rows
  membersRow1.innerHTML = "";
  membersRow2.innerHTML = "";

  members.forEach((member, index) => {
    const memberCard = document.createElement("div");
    // Add AOS attributes here
    memberCard.setAttribute("data-aos", "zoom-in-up");
    memberCard.setAttribute("data-aos-delay", index * 50);
    memberCard.className =
      "bg-white rounded-xl p-6 border border-gray-200 transition-shadow";

    const socialLinksHTML = member.socialLinks
      .map(
        (social) =>
          `<a href="${social.url}" class="text-[#000249] hover:text-blue-600 transition-colors" target="_blank" rel="noopener noreferrer">
                <i class="${social.icon} text-lg"></i>
            </a>`
      )
      .join("");

    // **MODIFIED SECTION**: Applied mentor card styles to team member cards
    memberCard.innerHTML = `
            <div class="text-center">
                <div class="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
                    ${
                      member.image
                        ? `<img src="${member.image}" alt="${member.name}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/96x96/cccccc/ffffff?text=Member'; this.nextElementSibling.style.display='block';">
                         <span class="w-full h-full bg-gradient-to-b from-gray-400 to-[#000249] hidden"></span>`
                        : `<span class="w-full h-full bg-gradient-to-b from-gray-400 to-[#000249]"></span>`
                    }
                </div>
                <h3 class="font-bold text-[#000249] text-base mb-2">${
                  member.name
                }</h3>
                <p class="text-blue-600 font-semibold text-sm mb-4">${
                  member.role
                }</p>
                <div class="flex justify-center space-x-4">
                    ${socialLinksHTML}
                </div>
            </div>
        `;

    // First 3 go to row 1, rest go to row 2
    if (index < 3) {
      membersRow1.appendChild(memberCard);
    } else {
      membersRow2.appendChild(memberCard);
    }
  });
}

// Utility functions for image changes
function changeHeroImage(imageUrl) {
  const heroImage = document.getElementById("heroImage");
  if (heroImage) heroImage.src = imageUrl;
}

function changeStadiumImage(imageUrl) {
  const stadiumImage = document.getElementById("stadiumImage");
  if (stadiumImage) stadiumImage.src = imageUrl;
}

// Functions to manage featured mentors
function addFeaturedMentor(
  name,
  role,
  image = null,
  description = "",
  socialLinks = []
) {
  featuredMentors.push({ name, role, image, description, socialLinks });
  renderFeaturedMentors();
}

function removeFeaturedMentor(index) {
  featuredMentors.splice(index, 1);
  renderFeaturedMentors();
}

function updateMentorSocials(index, socialLinks) {
  if (featuredMentors[index]) {
    featuredMentors[index].socialLinks = socialLinks;
    renderFeaturedMentors();
  }
}

function updateMentorImage(index, imageUrl) {
  if (featuredMentors[index]) {
    featuredMentors[index].image = imageUrl;
    renderFeaturedMentors();
  }
}

// Functions to manage team members
function addMember(name, role, image = null, socialLinks = []) {
  members.push({ name, role, image, socialLinks });
  renderMembers();
}

function removeMember(index) {
  members.splice(index, 1);
  renderMembers();
}

function updateMemberImage(index, imageUrl) {
  if (members[index]) {
    members[index].image = imageUrl;
    renderMembers();
  }
}

function updateMemberSocials(index, socialLinks) {
  if (members[index]) {
    members[index].socialLinks = socialLinks;
    renderMembers();
  }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  initHamburgerMenu();
  initModernHeroSlider(); // Added this line
  renderFeaturedMentors();
  renderMembers();
  // Re-initialize AOS after dynamic content is loaded
  AOS.refresh();
});