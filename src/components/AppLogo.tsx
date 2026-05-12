interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 32, className = "" }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#a381a7" />
      <circle cx="16" cy="16" r="9" stroke="white" strokeWidth="2" fill="none" />
      <path
        d="M11 16.5L14.5 20L21 13"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
