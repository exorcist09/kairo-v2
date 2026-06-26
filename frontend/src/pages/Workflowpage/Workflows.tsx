"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Clock, CheckCircle, Trash, ArrowUpRight, Pen, FolderDashed, MagnifyingGlass } from "@phosphor-icons/react";
import CreateWorkflowModal from "./components/CreateWorkflowModal";

type Workflow = {
  id: string;
  name: string;
  status: "draft" | "ongoing" | "completed";
  updatedAt: string;
};

const INITIAL_WORKFLOWS: Workflow[] = [
  { id: "1", name: "Data Ingestion Pipeline", status: "draft", updatedAt: "2 mins ago" },
  { id: "2", name: "Nightly Database Backup", status: "ongoing", updatedAt: "1 hour ago" },
  { id: "3", name: "Customer Onboarding", status: "completed", updatedAt: "Yesterday" },
];

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkflows = workflows.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const drafts = filteredWorkflows.filter((w) => w.status === "draft");
  const ongoing = filteredWorkflows.filter((w) => w.status === "ongoing");
  const completed = filteredWorkflows.filter((w) => w.status === "completed");

  const handleDelete = (id: string) => {
    setWorkflows(workflows.filter((w) => w.id !== id));
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreate = (name: string, description: string) => {
    const newWf: Workflow = {
      id: Date.now().toString(),
      name: name,
      status: "draft",
      updatedAt: "Just now",
    };
    setWorkflows([newWf, ...workflows]);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
        
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
            />
          </div>

          <button 
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus weight="bold" className="w-4 h-4" />
            Add New Workflow
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {filteredWorkflows.length === 0 ? (
          /* Empty State */
          <div className="w-full h-64 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <FolderDashed weight="duotone" className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {searchQuery ? "No matching workflows" : "No Workflows Yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchQuery ? "Try adjusting your search query." : "Create your first workflow to get started."}
            </p>
            {!searchQuery && (
              <button 
                onClick={handleOpenModal}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Plus weight="bold" className="w-4 h-4" />
                Create Workflow
              </button>
            )}
          </div>
        ) : (
          /* Populated State */
          <div className="flex flex-col gap-10">
            
            {/* Drafts Section */}
            {drafts.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recently Created / Drafts</h2>
                <div className="flex flex-col gap-3">
                  {drafts.map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Pen weight="duotone" className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{w.name}</span>
                          <span className="text-xs text-gray-500">Last edited: {w.updatedAt}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/editor/${w.id}`}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Open Editor <ArrowUpRight weight="bold" className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Ongoing Section */}
            {ongoing.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Ongoing</h2>
                <div className="flex flex-col gap-3">
                  {ongoing.map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                          <Clock weight="duotone" className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{w.name}</span>
                          <span className="text-xs text-gray-500">Running since: {w.updatedAt}</span>
                        </div>
                      </div>
                      <button className="flex items-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-100">
                        View Progress <ArrowUpRight weight="bold" className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Section */}
            {completed.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Completed</h2>
                <div className="flex flex-col gap-3">
                  {completed.map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                          <CheckCircle weight="fill" className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{w.name}</span>
                          <span className="text-xs text-gray-500">Completed: {w.updatedAt}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(w.id)}
                        className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                      >
                        <Trash weight="bold" className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>

      <CreateWorkflowModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreate}
      />
    </div>
  );
}
