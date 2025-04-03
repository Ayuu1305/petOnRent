export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
