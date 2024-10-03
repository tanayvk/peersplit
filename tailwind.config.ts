import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        fern: {
          "50": "#f3faf3",
          "100": "#e3f5e4",
          "200": "#c9e9cb",
          "300": "#9ed7a3",
          "400": "#72bf78",
          "500": "#47a04e",
          "600": "#36833c",
          "700": "#2d6832",
          "800": "#28532c",
          "900": "#224526",
          "950": "#0e2511",
        },
        space: {
          "50": "#f4f7f7",
          "100": "#e2eaeb",
          "200": "#c8d6d9",
          "300": "#a1babf",
          "400": "#73969d",
          "500": "#587b82",
          "600": "#4c676e",
          "700": "#42555c",
          "800": "#3b494f",
          "900": "#2c3539",
          "950": "#20292c",
        },
        "hawkes-blue": {
          "50": "#eff5fe",
          "100": "#e2ecfd",
          "200": "#d2e0fb",
          "300": "#abc3f6",
          "400": "#89a1f0",
          "500": "#6c81e8",
          "600": "#515dda",
          "700": "#424bc0",
          "800": "#38409b",
          "900": "#343c7b",
          "950": "#1e2148",
        },
      },
      fontFamily: {
        sans: ["Fredoka", ...defaultTheme.fontFamily.sans],
      },
    },
  },
};
