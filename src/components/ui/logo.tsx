import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

export const Logo = ({ className = "", size = "medium", showText = true }: LogoProps) => {
  const sizeMap = {
    small: 32,
    medium: 40,
    large: 56
  };

  const actualSize = sizeMap[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <Image
          src="/logo.png"
          alt="TecClub Monitor"
          width={actualSize}
          height={actualSize}
          className="rounded-lg"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-gray-900">TecClub</span>
          <span className="text-sm text-blue-600 font-medium">Monitor</span>
        </div>
      )}
    </div>
  );
};

export default Logo;