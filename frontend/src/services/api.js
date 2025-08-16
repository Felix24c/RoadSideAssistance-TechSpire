// services/api.js
const API_BASE = "http://127.0.0.1:8000/api"; // Django backend URL

// Example: fetch all service providers
export async function getServiceProviders() {
  try {
    const response = await fetch(`${API_BASE}/providers`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch providers:", error);
    return [];
  }
}
