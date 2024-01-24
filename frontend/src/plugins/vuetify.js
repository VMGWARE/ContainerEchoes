/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

// Custom color palette
const customColors = {
  blueCrayola: "#0073FE",
  azul: "#0171C5",
  black: "#000000",
  vividSkyBlue: "#08DFFD",
  // Additional colors for a more comprehensive palette
  darkBlue: "#005792",
  lightBlue: "#69B2F8",
  darkGray: "#303030",
  lightGray: "#F5F5F5",
  white: "#FFFFFF",
};

const myCustomLightTheme = {
  dark: false,
  colors: {
    primary: customColors.blueCrayola,
    secondary: customColors.azul,
    accent: customColors.vividSkyBlue,
    anchor: customColors.black,
    background: customColors.lightGray, // Page background
    surface: customColors.white, // Card and sheets
    success: customColors.lightBlue,
    info: customColors.darkBlue,
    warning: "#FFC107", // Example warning color
    error: "#FF5252", // Example error color
  },
  variables: {
    // Custom variables
  },
};

const myCustomDarkTheme = {
  dark: true,
  colors: {
    primary: customColors.blueCrayola,
    secondary: customColors.azul,
    accent: customColors.vividSkyBlue,
    anchor: customColors.white,
    background: customColors.darkGray, // Page background
    surface: customColors.black, // Card and sheets
    success: customColors.lightBlue,
    info: customColors.darkBlue,
    warning: "#FFC107", // Example warning color
    error: "#FF5252", // Example error color
  },
  variables: {
    // Custom variables
  },
};

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      dark: myCustomDarkTheme,
      light: myCustomLightTheme,
    },
    defaultTheme: "dark",
  },
});
