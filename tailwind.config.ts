import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                serif: ["Lora", "Georgia", "serif"],
                display: ["Outfit", "Inter", "sans-serif"],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#ffb600",
                    hover: "#eab308",
                    foreground: "#000000",
                },
                amber: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                    950: '#451a03',
                },
                panel: "var(--panel)",
                surface: "var(--surface)",
                muted: "#94a3b8",
                error: "#ef4444",
                success: "#22c55e",
                warning: "#f59e0b",
                zinc: {
                    950: "#09090b",
                }
            },
            boxShadow: {
                'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                'accent': '0 0 20px rgba(255, 182, 0, 0.15)',
            },
            backgroundImage: {
                'gradient-premium': 'linear-gradient(135deg, #FFB600 0%, #FFD700 100%)',
                'gradient-dark': 'linear-gradient(to bottom, #16191E, #0D0F12)',
                'glass-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
            }
        },
    },
    plugins: [],
};
export default config;
