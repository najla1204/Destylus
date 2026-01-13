import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#f59e0b",
                    hover: "#d97706",
                    foreground: "#000000",
                },
                panel: "#161b22",
                surface: "#1f2937",
                muted: "#9ca3af",
                error: "#ef4444",
                success: "#10b981",
                warning: "#f59e0b",
            },
        },
    },
    plugins: [],
};
export default config;
