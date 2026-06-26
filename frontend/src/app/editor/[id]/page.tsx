import Editor from "@/editor/Editor";

export default function EditorPage({ params }: { params: { id: string } }) {
  return <Editor workflowId={params.id} />;
}
