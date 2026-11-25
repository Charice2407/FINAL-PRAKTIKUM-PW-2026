import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {query} from "@/lib/db";
import {requireUserRole} from "@/lib/server-auth";
import LogoutButton from "@/components/LogoutButton";
import ContentManagementClient from "@/components/ContentManagementClient";
export default async function TeacherCourseContents({params}){const user=await requireUserRole(["teacher"]);if(!user)redirect("/login");const {id}=await params;const [course,contents]=await Promise.all([query("SELECT id,title FROM courses WHERE id=$1 AND teacher_id=$2",[id,user.id]),query("SELECT id,title,content,order_index FROM contents WHERE course_id=$1 ORDER BY order_index",[id])]);if(!course.rows[0])notFound();return <main className="min-h-screen bg-slate-50"><header className="border-b bg-white px-6 py-5"><div className="mx-auto flex max-w-7xl justify-between"><Link href="/dashboard/teacher/courses" className="font-bold text-cyan-700">← Course Management</Link><LogoutButton/></div></header><section className="mx-auto max-w-7xl px-6 py-10"><h1 className="text-3xl font-black">Kelola Materi</h1><p className="mb-8 mt-2 text-slate-500">Course: <b>{course.rows[0].title}</b>. Materi hanya dapat dikelola oleh Teacher pemilik course.</p><ContentManagementClient courseId={id} initialContents={contents.rows}/></section></main>}
