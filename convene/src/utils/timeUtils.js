// Utility functions for time formatting and conversion

/**
 * Convert 12-hour time string to 24-hour format for API
 * @param {string} time12 - Time in format "HH:MM AM/PM"
 * @returns {string} - Time in 24-hour format "HH:MM"
 */
export function convert12To24Hour(time12) {
  if (!time12) return "";
  
  const [time, period] = time12.split(" ");
  const [hours, minutes] = time.split(":");
  
  let hour24 = parseInt(hours, 10);
  
  if (period === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, "0")}:${minutes}`;
}

/**
 * Convert 24-hour time string to 12-hour format for display
 * @param {string} time24 - Time in format "HH:MM"
 * @returns {string} - Time in 12-hour format "HH:MM AM/PM"
 */
export function convert24To12Hour(time24) {
  if (!time24) return "";
  
  const [hours, minutes] = time24.split(":");
  const hour24 = parseInt(hours, 10);
  
  let hour12 = hour24;
  let period = "AM";
  
  if (hour24 === 0) {
    hour12 = 12;
  } else if (hour24 === 12) {
    hour12 = 12;
    period = "PM";
  } else if (hour24 > 12) {
    hour12 = hour24 - 12;
    period = "PM";
  }
  
  return `${hour12}:${minutes} ${period}`;
}

/**
 * Format ISO date string to readable format
 * @param {string} isoString - ISO date string
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export function formatDateTime(isoString, options = {}) {
  if (!isoString) return "";
  
  const date = new Date(isoString);
  
  const defaultOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...options
  };
  
  return date.toLocaleDateString("en-US", defaultOptions);
}

/**
 * Format time only from ISO string
 * @param {string} isoString - ISO date string
 * @returns {string} - Formatted time string
 */
export function formatTime(isoString) {
  if (!isoString) return "";
  
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

/**
 * Format date only from ISO string
 * @param {string} isoString - ISO date string
 * @returns {string} - Formatted date string
 */
export function formatDate(isoString) {
  if (!isoString) return "";
  
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

/**
 * Get current time in 12-hour format for default input
 * @returns {string} - Current time in "HH:MM AM/PM" format
 */
export function getCurrentTime12Hour() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}
