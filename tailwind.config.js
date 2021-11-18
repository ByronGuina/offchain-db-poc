import { colors } from 'tailwindcss/colors';

const config = {
    purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        colors: {
            gray: colors.warmGray,
        },
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [],
};

export default config;
