/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                obsidian: '#0F172A',
                amber: '#F59E0B',
                copper: '#B45309',
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                mono: ['"Roboto Mono"', 'monospace'],
            }
        },
    },
    plugins: [],
}