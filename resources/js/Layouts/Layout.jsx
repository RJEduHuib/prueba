import { useState, useEffect } from "react";

import Sidebar from "@/Components/Sidebar";
import Header from "@/Components/Header";

import { RiCloseLine, RiMenu3Fill } from "react-icons/ri";

import { Head } from "@inertiajs/react";
import { ToastContainer, toast } from "react-toastify";

export default function DashboardLayout({ children, title }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            <Head title={title} />

            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            <button
                onClick={() => {
                    setSidebarOpen(!sidebarOpen);
                }}
                className="fixed bottom-4 right-4 lg:hidden bg-sky-300 p-2 text-sky-600 rounded-full text-2xl focus:outline-none z-50"
            >
                {sidebarOpen ? <RiCloseLine /> : <RiMenu3Fill />}
            </button>

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <main className="flex-grow">
                    <div className="w-full mx-auto">{children}</div>
                </main>

                <ToastContainer />
            </div>
        </div>
    );
}
