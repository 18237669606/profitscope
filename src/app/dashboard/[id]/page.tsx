import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { type Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project as Project} />;
}
