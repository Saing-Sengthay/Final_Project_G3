// Function to post a comment
// MODIFIED: Accepts eventUuid and commentContent as arguments
async function postComment(eventUuid, commentContent) {
  // Define the API endpoint URL
  const apiUrl = "https://sport-hub.eunglyzhia.social/api/v1/comments";

  // Check if the comment is empty (already checked in detail.js, but good to have here too)
  if (commentContent.trim() === "") {
    showNotification("Please enter a comment before posting.", "error"); // Use showNotification instead of alert
    return;
  }

  // Create the request body as a JavaScript object
  const requestBody = {
    eventUuid: eventUuid, // Use the eventUuid passed as an argument
    comment: commentContent, // Use the commentContent passed as an argument
  };

  try {
    // Send the POST request to the API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error response
      throw new Error(
        `Network response was not ok, status: ${response.status}. Message: ${
          errorData.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    console.log("Success:", data);
    showNotification("Comment posted successfully!", "success"); // Use showNotification

    // After successful post, re-fetch comments to update the list
    // Assuming currentEvent.id is the 'sportId' the API expects for fetching comments
    if (window.currentEvent && window.currentEvent.id) {
      // Access global currentEvent from detail.js
      fetchComments(window.currentEvent.id);
    } else {
      console.warn(
        "Could not re-fetch comments: currentEvent or its ID is missing."
      );
    }
  } catch (error) {
    // Handle any errors during the fetch request
    console.error("Error posting comment:", error);
    showNotification(`Failed to post comment: ${error.message}`, "error"); // Use showNotification
  }
}

// Function to display the newly posted comment (this is now redundant if fetchComments is called)
// This function is kept here, but its direct use for new comments is replaced by re-fetching.
function displayNewComment(commentData) {
  const commentsContainer = document.getElementById("commentsContainer");

  // Create a new comment element (example structure from the HTML)
  const newCommentSection = document.createElement("section");
  newCommentSection.className = "flex space-x-3 mb-4";

  // User profile picture element
  const userFigure = document.createElement("figure");
  userFigure.className =
    "w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0";
  const userIcon = document.createElement("i");
  userIcon.className = "fas fa-user text-gray-600";
  userFigure.appendChild(userIcon);

  // Comment content section
  const commentContentSection = document.createElement("section");
  commentContentSection.className =
    "flex-1 p-4 bg-gray-100 rounded-lg dark:bg-gray-700";

  // Comment text paragraph
  const commentParagraph = document.createElement("p");
  commentParagraph.className = "text-gray-800 dark:text-gray-300";
  commentParagraph.textContent = commentData.comment || commentData.content; // Use the comment from the API response
  // Assuming 'user' object exists and has a 'name' property for display
  const userName =
    commentData.user && commentData.user.name
      ? commentData.user.name
      : "Anonymous";
  const userAvatarInitial = userName.substring(0, 2).toUpperCase();
  const commentTime = commentData.createdAt
    ? new Date(commentData.createdAt).toLocaleString()
    : "Just now";

  commentContentSection.innerHTML = `
          <section class="flex items-center space-x-2 mb-1">
              <span class="font-medium custom-text">${userName}</span>
              <span class="text-xs text-gray-500">${commentTime}</span>
          </section>
          <p class="text-gray-700 text-sm">${
            commentData.comment || commentData.content
          }</p>
      `;

  // Add the elements to the main comment section
  newCommentSection.appendChild(userFigure);
  newCommentSection.appendChild(commentContentSection);

  // Add the new comment section to the top of the comments container
  commentsContainer.prepend(newCommentSection);
}

// Ensure showNotification is available (it's defined in detail.js, so make it global if not already)
// This is a safety measure. If detail.js is loaded first, showNotification will be available.
// If not, this provides a basic fallback.
if (typeof showNotification === "undefined") {
  window.showNotification = function (message, type = "success") {
    console.log(`Notification (${type}): ${message}`);
    // You might want to implement a more robust notification system here
    // For now, this prevents errors if the function isn't found.
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white font-medium ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : "bg-blue-500"
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };
}

// Ensure fetchComments is available (it's defined in detail.js)
// This is crucial because postComment now relies on it.
if (typeof fetchComments === "undefined") {
  window.fetchComments = async function (eventId) {
    console.warn(
      "fetchComments function not found globally. Cannot re-fetch comments."
    );
    // Implement a basic fetch here if it's truly not available
    // Or ensure detail.js is loaded before Postcomments.js
  };
}

// Ensure currentEvent is available globally for fetchComments
// It's usually set in detail.js's loadEventData.
if (typeof currentEvent === "undefined") {
  window.currentEvent = null; // Initialize as null
}
