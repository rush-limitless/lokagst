const GRADIENTS = [
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-600",
  "from-cyan-400 to-sky-600",
  "from-fuchsia-400 to-purple-600",
  "from-lime-400 to-green-600",
];

function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

export function UserAvatar({ nom, prenom, photo, size = "md" }: { nom: string; prenom: string; photo?: string | null; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-16 h-16 text-xl" };
  const gradient = GRADIENTS[hashCode(nom + prenom) % GRADIENTS.length];

  if (photo) {
    return <img src={photo} alt={`${prenom} ${nom}`} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-gray-800`} />;
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold ring-2 ring-white dark:ring-gray-800 shadow-sm`}>
      {prenom[0]}{nom[0]}
    </div>
  );
}
