/**
 * Root layout for the app (applies to all routes)
 * - Sets up global styles, font, metadata, and manifest
 * - Registers the service worker for PWA support
 * - Wraps all pages in <html> and <body>
 */
import './globals.css'; // Global CSS (Tailwind, DaisyUI, etc)
import { Orbitron } from 'next/font/google'; // Google font for sci-fi look
import Register from '../pwa/sw/Register'; // Registers the service worker

// Next.js metadata for SEO, PWA, and Apple web app
export const metadata = {
    title: 'Imperial Watch App',
    description: 'Galactic Empire field operations',
    icons: {
        shortcut: '/icons/favicon.ico',
        apple: {
            url: '/icons/apple-touch-icon.png',
        },
    },

// Load Orbitron font and set CSS variable
const orbitron = Orbitron({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-orbitron',
    weight: ['400', '500', '600', '700', '800', '900'],
});

// Viewport and theme color for PWA/Apple
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: dark)', color: '#000000' },
        { media: '(prefers-color-scheme: light)', color: '#111111' },
    ],
};

/**
 * RootLayout wraps all pages. Adds the font, applies antialiasing, and registers the SW.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export default function RootLayout({ children }) {
    return (
        <html lang="es" className={orbitron.variable}>
            <body className="antialiased">
                {/* All route content rendered here */}
                {children}
                {/* Register service worker for PWA features */}
                <Register />
            </body>
        </html>
    );
}
