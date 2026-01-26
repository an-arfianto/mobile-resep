// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat";

export default defineConfig([
    expoConfig,
    {
        ignores: ["dist/*"],
    },
    {
        rules: {
            // Let TypeScript handle these
            "@typescript-eslint/no-unused-vars": "off",
            "no-unused-vars": "off",

            // React / RN noise
            "react-hooks/exhaustive-deps": "off",
            "react/display-name": "off",

            // Dev comfort
            "no-console": "off",
        },
    },
]);
