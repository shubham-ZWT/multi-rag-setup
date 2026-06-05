'use client";';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  extraClasses?: string;
  isprimary?: boolean;
}
export default function Button({
  onClick,
  children,
  extraClasses,
  isprimary,
}: ButtonProps) {
  const baseClasses = "px-6 py-3 rounded-full hover:bg-blue-700 transition";
  const primaryClasses =
    "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-base px-4 py-2.5 text-center leading-5 transition-all duration-150 ease-in-out";
  const secondaryClasses = "bg-primary text-secondary text-sm hover:bg-primary/90";

  const buttonClasses = isprimary
    ? `${baseClasses} ${primaryClasses}`
    : `${baseClasses} ${secondaryClasses}`;

  return (
    <button
      className={`${buttonClasses} ${extraClasses || ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
