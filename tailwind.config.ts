/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TWN Brand Colors (extracted from twn.ee)
        twn: {
          navy:    '#1A2B4A',   // primary dark navy
          navyDark:'#0F1C32',   // deeper bg
          navyMid: '#1E3356',   // card surfaces
          navyLight:'#243D68',  // hover states
          coral:   '#E8452A',   // primary accent / CTA
          coralLight:'#FF6347', // hover coral
          coralDark:'#C73520',  // pressed coral
          teal:    '#1AA39A',   // secondary accent
          tealLight:'#22C4BA',  // highlight
          amber:   '#F0A500',   // warning
          green:   '#18A474',   // success / confirmed
          greenLight:'#1DC98D',
          red:     '#D93025',   // error / rejected
          redLight:'#E8523A',
          white:   '#FFFFFF',
          offwhite:'#F4F7FB',
          gray100: '#E8EDF5',
          gray200: '#C8D3E5',
          gray400: '#8A9BBB',
          gray500: '#6B7FA0',
          gray600: '#4A5C7A',
          border:  'rgba(255,255,255,0.08)',
          border2: 'rgba(255,255,255,0.14)',
        }
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 8px 32px rgba(0,0,0,0.35)',
        'card-sm': '0 4px 16px rgba(0,0,0,0.25)',
        'coral': '0 4px 20px rgba(232,69,42,0.35)',
        'teal': '0 4px 20px rgba(26,163,154,0.35)',
        'navy': '0 4px 20px rgba(15,28,50,0.5)',
      }
    },
  },
  plugins: [],
}
