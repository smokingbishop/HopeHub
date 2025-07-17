import type { SVGProps } from 'react';

export function HopeHubLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.01 0 1.97.25 2.8.7l-1.46 1.46C13.01 7.85 12.51 7.7 12 7.7c-2.37 0-4.3 1.93-4.3 4.3s1.93 4.3 4.3 4.3c.51 0 1.01-.15 1.34-.34l1.46 1.46c-.83.45-1.79.7-2.8.7z" />
      <path d="M15 12c0 1.66-1.34 3-3 3" />
    </svg>
  );
}
