"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function JoinCourseButton({ courseId, enrolled=false, loggedIn=false, role="" }) {
 const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const router=useRouter();
 async function join(){ if(!loggedIn){router.push("/login");return;} if(role!=="student"){setMessage("Hanya Student yang dapat bergabung ke course.");return;} setBusy(true);try{const r=await fetch(`/api/courses/${courseId}/enroll`,{method:"POST"});const d=await r.json();if(!r.ok){setMessage(d.message);return;}router.push(`/learn/${courseId}`);router.refresh();}catch{setMessage("Tidak dapat terhubung ke server.");}finally{setBusy(false);} }
 return <div><button onClick={join} disabled={busy} className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-white hover:bg-cyan-600 disabled:opacity-60">{busy?"Memproses...":enrolled?"Continue Learning":"Join Course"}</button>{message&&<p className="mt-2 text-sm text-red-600">{message}</p>}</div>;
}
