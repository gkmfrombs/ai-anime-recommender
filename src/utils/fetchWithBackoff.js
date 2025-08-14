// utils/fetchWithBackoff.js

/**
 * Fetch helper with exponential backoff retries.
 */
export const fetchWithBackoff = async (url, options, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        console.warn(`Rate limited. Retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
        return fetchWithBackoff(url, options, retries - 1, delay * 2);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    if (retries > 0) {
      console.warn(`Request failed. Retrying in ${delay / 1000}s...`);
      await new Promise(res => setTimeout(res, delay));
      return fetchWithBackoff(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
};
