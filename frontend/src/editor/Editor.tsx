import EditorSidebar from "./EditorSidebar";
import EditorTopbar from "./EditorTopbar";
import EditorCanvas from "./EditorCanvas";

interface EditorProps {
  workflowId: string;
}

export default function Editor({ workflowId }: EditorProps) {
  return (
    <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden font-sans">
      {/* Top Bar (Full Width) */}
      <EditorTopbar />

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <EditorSidebar />
        
        {/* React Flow Canvas */}
        <div className="flex-1 relative">
          <EditorCanvas />
        </div>
      </div>
    </div>
  );
}