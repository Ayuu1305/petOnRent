import { API_URL } from "../config";

/**
 * Submit a new issue to the backend
 * @param {Object} issueData - The issue data to submit
 * @returns {Promise<Object>} - The response from the server
 */
export const submitIssue = async (issueData) => {
  try {
    console.log("Submitting issue with data:", issueData);

    // Add timestamp and status to the issue data if not present
    const dataToSubmit = {
      ...issueData,
      status: issueData.status || "pending",
      createdAt: issueData.createdAt || new Date().toISOString(),
      lastUpdated: issueData.lastUpdated || new Date().toISOString(),
      expectedResolutionDate:
        issueData.expectedResolutionDate ||
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: issueData.assignedTo || "support@petrental.com",
      resolutionNotes:
        issueData.resolutionNotes ||
        "Your issue has been received and will be addressed by our support team.",
      priority: issueData.priority || "medium",
      category: issueData.issueType || "general",
      petDetails: {
        category:
          issueData.petDetails?.category ||
          issueData.petCategory ||
          "Not specified",
        name:
          issueData.petDetails?.name || issueData.petName || "Not specified",
        id: issueData.petDetails?.id || issueData.petId || "Not specified",
      },
    };

    console.log("Formatted data to submit:", dataToSubmit);

    // Get the token from localStorage
    const token = localStorage.getItem("token");
    console.log("Using token:", token ? "Token present" : "No token");

    // Make the API request
    const response = await fetch(`${API_URL}/api/issues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(dataToSubmit),
    });

    console.log("Response status:", response.status);

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to parse error response" }));
      console.error("Error response:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // Return the response data
    const responseData = await response.json();
    console.log("Success response:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error in submitIssue:", error);
    // Check if it's a network error
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Network error: Please check your internet connection and try again."
      );
    }
    throw error;
  }
};

/**
 * Get all issues for the current user
 * @returns {Promise<Array>} - The list of issues
 */
export const getUserIssues = async () => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem("token");

    // Make the API request
    const response = await fetch(`${API_URL}/api/issues/user`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // Return the response data
    return await response.json();
  } catch (error) {
    console.error("Error fetching user issues:", error);
    // Check if it's a network error
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Network error: Please check your internet connection and try again."
      );
    }
    throw error;
  }
};

/**
 * Get a specific issue by ID
 * @param {string} issueId - The ID of the issue to fetch
 * @returns {Promise<Object>} - The issue data
 */
export const getIssueById = async (issueId) => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem("token");

    // Make the API request
    const response = await fetch(`${API_URL}/api/issues/${issueId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // Return the response data
    return await response.json();
  } catch (error) {
    console.error("Error fetching issue:", error);
    // Check if it's a network error
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Network error: Please check your internet connection and try again."
      );
    }
    throw error;
  }
};

/**
 * Get all issues for a user by email
 * @param {string} email - The email of the user
 * @returns {Promise<Array>} - The list of issues
 */
export const getUserIssuesByEmail = async (email) => {
  try {
    // Make the API request without authentication
    const response = await fetch(`${API_URL}/api/issues/user/${email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch issues");
    }

    // Return the response data
    return await response.json();
  } catch (error) {
    console.error("Error fetching user issues:", error);
    throw error;
  }
};

/**
 * Update the status of an issue
 * @param {string} issueId - The ID of the issue to update
 * @param {string} status - The new status for the issue (cancelled, pending, in-progress, resolved)
 * @returns {Promise<Object>} - The updated issue data
 */
export const updateIssueStatus = async (issueId, status) => {
  try {
    // Get the token from localStorage (assuming authentication might be needed)
    const token = localStorage.getItem("token");

    console.log(`Attempting to update issue ${issueId} to status ${status}`);

    const response = await fetch(`${API_URL}/api/issues/${issueId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "", // Add Authorization if needed
      },
      body: JSON.stringify({ status }),
    });

    console.log(`Update status response status: ${response.status}`);

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse JSON error response:", jsonError);
          errorData = { message: `HTTP error! Status: ${response.status}` };
        }
      } else {
        // Handle non-JSON responses (like HTML error pages)
        const textResponse = await response.text();
        console.error("Non-JSON error response:", textResponse);
        errorData = {
          message: `Server returned status ${response.status}. Check backend logs.`,
        };
      }
      console.error("Error data from server:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // Return the response data if successful (assuming backend sends updated issue)
    const responseData = await response.json();
    console.log("Successfully updated issue status:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error in updateIssueStatus function:", error);
    // Add check for network errors if needed
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Network error: Could not reach the server. Please check your connection."
      );
    }
    // Re-throw the error to be caught by the calling function (handleCancelIssue)
    throw error;
  }
};
