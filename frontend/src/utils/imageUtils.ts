
/**
 * Utility functions for handling images
 */

// Import API_BASE_URL from constants
import { API_BASE_URL as CONSTANTS_API_BASE_URL } from "@/utils/constants";

// Define a constant for the API base URL
export const API_BASE_URL = CONSTANTS_API_BASE_URL || window.location.origin;

/**
 * Converts a relative path to a complete image URL
 * @param relativePath The relative path to the image
 * @returns The complete URL to the image
 */
export const getImageUrl = (relativePath: string): string => {
  // If the path is null, undefined or empty, return a default image
  if (!relativePath) {
    return 'https://source.unsplash.com/random/800x600?billboard';
  }
  
  // If the path already starts with http or https, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Remove leading slash if present to avoid double slashes
  const path = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  
  // Construct the complete URL using the API base URL from constants
  return `${API_BASE_URL}/${path}`;
};
