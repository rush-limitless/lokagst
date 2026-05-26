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

export function UserAvatar({ nom, prenom, photo, size = "md", status }: { nom: string; prenom: string; photo?: string | null; size?: "sm" | "md" | "lg"; status?: "ok" | "warning" | "danger" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-16 h-16 text-xl" };
  const dotSizes = { sm: "w-2.5 h-2.5", md: "w-3 h-3", lg: "w-4 h-4" };
  const dotColors = { ok: "bg-emerald-500", warning: "bg-orange-500", danger: "bg-red-500" };
  const gradient = GRADIENTS[hashCode(nom + prenom) % GRADIENTS.length];

  const dot = status ? (
    <span className={`absolute -bottom-0.5 -right-0.5 ${dotSizes[size]} ${dotColors[status]} rounded-full ring-2 ring-white dark:ring-gray-800`} />
  ) : null;

  if (photo) {
    return (
      <div className="relative shrink-0">
        <img src={photo} alt={`${prenom} ${nom}`} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-gray-800`} />
        {dot}
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold ring-2 ring-white dark:ring-gray-800 shadow-sm`}>
        {prenom[0]}{nom[0]}
      </div>
      {dot}
    </div>
  );
}
