import coreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...coreWebVitals,
  { ignores: ["build/"] },
  {
    rules: {
      // ponytail: pre-existing example patterns, refactor if these pages grow
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];
