import dynamic from "next/dynamic";

const NouveauMdpContent = dynamic(() => import("./content"), { ssr: false });

export default function NouveauMdpPage() {
  return <NouveauMdpContent />;
}
