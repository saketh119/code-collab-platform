"use client";

import Terminal from "@/components/Terminal";
import { Plus, X } from "lucide-react";
import { useState } from "react";

type TerminalTab = {
    id: string;
    name: string;
    wsUrl: string;
};

export default function TerminalTabs({ initialWsUrl }: { initialWsUrl: string }) {
    const [tabs, setTabs] = useState<TerminalTab[]>([
        {
            id: "1",
            name: "Terminal 1",
            wsUrl: initialWsUrl,
        },
    ]);
    const [activeTabId, setActiveTabId] = useState("1");

    const addTab = () => {
        const newId = (tabs.length + 1).toString();
        const newTab: TerminalTab = {
            id: newId,
            name: `Terminal ${newId}`,
            wsUrl: initialWsUrl,
        };
        setTabs([...tabs, newTab]);
        setActiveTabId(newId);
    };

    const closeTab = (id: string) => {
        if (tabs.length === 1) return; // Don't close the last tab

        const newTabs = tabs.filter((tab) => tab.id !== id);
        setTabs(newTabs);

        if (activeTabId === id) {
            setActiveTabId(newTabs[0].id);
        }
    };

    const activeTab = tabs.find((tab) => tab.id === activeTabId);

    return (
        <div className="h-full flex flex-col bg-neutral-900">
            {/* Tab Bar */}
            <div className="flex items-center gap-1 px-2 bg-neutral-950 border-b border-neutral-800">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={`
              flex items-center gap-2 px-3 py-2 text-sm cursor-pointer group
              ${activeTabId === tab.id
                                ? "bg-neutral-900 text-white border-b-2 border-blue-500"
                                : "text-neutral-400 hover:text-neutral-200"
                            }
            `}
                        onClick={() => setActiveTabId(tab.id)}
                    >
                        <span>{tab.name}</span>
                        {tabs.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(tab.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                ))}

                <button
                    onClick={addTab}
                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition"
                    title="New Terminal"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 relative">
                {tabs.map((tab) => (
                    activeTabId === tab.id && (
                        <div key={tab.id} className="absolute inset-0">
                            <Terminal wsUrl={tab.wsUrl} />
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}
