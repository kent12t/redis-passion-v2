/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-circular-bold)', 'system-ui', 'sans-serif'],
                title: ['var(--font-circular-bold)', 'system-ui', 'sans-serif'],
            },
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                darkblue: '#418ccb',
                green: '#1dad6b',
                purple: '#ac4e9d',
                yellow: '#facb16',
                orange: '#eb5529',
            },
        },
    },
    plugins: [],
}; 