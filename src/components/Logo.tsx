import Image from 'next/image';

const Logo = () => {
    return (
        <div className="flex items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="hsl(var(--primary))"/>
                <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20" stroke="hsl(var(--background))" strokeWidth="3" strokeLinecap="round"/>
                <path d="M20 28L25.1962 19H14.8038L20 28Z" fill="hsl(var(--background))"/>
            </svg>
            <span className="text-2xl font-bold font-headline text-primary">QGO</span>
        </div>
    )
}

// A different logo that was in the original request.
const AlternativeLogo = () => (
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_101_2)">
            <path d="M20 40C8.95431 40 0 31.0457 0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40ZM20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35Z" fill="hsl(var(--primary))" />
            <path d="M32.0711 32.0711L37.0711 37.0711" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" />
            <text x="48" y="28" fontFamily="'PT Sans', sans-serif" fontSize="24" fontWeight="bold" fill="hsl(var(--primary))">QGO</text>
        </g>
        <defs>
            <clipPath id="clip0_101_2">
                <rect width="120" height="40" fill="white" />
            </clipPath>
        </defs>
    </svg>
)


export default Logo;