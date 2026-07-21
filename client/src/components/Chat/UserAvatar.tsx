import Image from "next/image";

interface UserAvatarProps {
  name: string;
  profilePicture?: string;
  size?: number;
  className?: string;
}

export default function UserAvatar({ name, profilePicture, size = 40, className = "" }: UserAvatarProps) {
  if (profilePicture) {
    return (
      <Image
        src={profilePicture}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full flex-shrink-0 ${className}`}
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
