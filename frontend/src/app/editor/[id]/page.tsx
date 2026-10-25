import Editor from "@/editor/Editor";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Editor workflowId={id} />;
}

