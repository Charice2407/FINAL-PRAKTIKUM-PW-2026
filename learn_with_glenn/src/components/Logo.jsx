import Image from "next/image";
export default function Logo({ compact = false, inverse = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image src="/images/logo-lwg.png" alt="" width={38} height={38} className="h-9 w-9 rounded-xl object-contain" priority />
      <span className={`text-base font-black tracking-tight sm:text-lg ${inverse ? "text-white" : "text-slate-900"}`}>
        Learn With <span className="text-cyan-500">Glenn</span>
        {!compact && <span className={`ml-1 hidden text-[10px] font-bold tracking-[.18em] sm:inline ${inverse ? "text-slate-400" : "text-slate-400"}`}>LWG</span>}
      </span>
    </span>
  );
}
