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
                sans: ['var(--font-circular-medium)', 'system-ui', 'sans-serif'],
                title: ['var(--font-circular-medium)', 'system-ui', 'sans-serif'],
            },
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                darkblue: '#4650a2',
                midblue: '#459bd1',
                lightblue: '#56ace0',
                green: '#4ba366',
                palegreen: '#83b87a',
                purple: '#a0549a',
                yellow: '#facc19',
                darkyellow: '#e8b628',
                orange: '#d96038',
                black: '#231f20',
            },
        },
    },
    plugins: [],
}; 