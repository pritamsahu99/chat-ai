/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "./my-components/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    fontFamily: {
      'gilroy': ['Gilroy Light', 'sans-serif'],
      'PP-Woodland': ['PP Woodland', 'sans-serif'],
      'Quiche-Sans': ['Quiche Sans', 'sans-serif'],
      'Saol-Text': ['Saol Text', 'sans-serif'],
    },
  },
};
export const plugins = [
  // require('@tailwindcss/forms'),
];
