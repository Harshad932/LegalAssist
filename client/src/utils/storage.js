// src/utils/storage.js
const getWindowId = () => {
  if (!window.__windowId) {
    // Use window.crypto if available, fallback to Date+random
    const randomId = window.crypto 
      ? window.crypto.randomUUID() 
      : `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    window.__windowId = `win_${window.name || randomId}`;
    
    // Ensure window.name stays consistent
    if (!window.name) {
      window.name = window.__windowId;
    }
  }
  return window.__windowId;
};

// Lawyer token methods
export const getLawyerToken = () => {
  return localStorage.getItem(`lawyerToken_${getWindowId()}`);
};

export const setLawyerToken = (token) => {
  localStorage.setItem(`lawyerToken_${getWindowId()}`, token);
};

export const removeLawyerToken = () => {
  localStorage.removeItem(`lawyerToken_${getWindowId()}`);
};

// Lawyer data methods
export const getLawyerData = () => {
  const data = localStorage.getItem(`lawyerData_${getWindowId()}`);
  return data ? JSON.parse(data) : null;
};

export const setLawyerData = (data) => {
  localStorage.setItem(`lawyerData_${getWindowId()}`, JSON.stringify(data));
};

export const removeLawyerData = () => {
  localStorage.removeItem(`lawyerData_${getWindowId()}`);
};

// Clear all window-specific data
export const clearWindowData = () => {
  removeLawyerToken();
  removeLawyerData();
};