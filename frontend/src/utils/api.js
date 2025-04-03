// API Configuration
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// Common headers
export const headers = {
  "Content-Type": "application/json",
};

export const fetchPets = async () => {
  const response = await fetch(`${API_URL}/pets`);
  return response.json();
};

export const fetchPetById = async (id) => {
  const response = await fetch(`${API_URL}/pets/${id}`);
  return response.json();
};

export const createOrder = async (orderData) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });
  return response.json();
};
