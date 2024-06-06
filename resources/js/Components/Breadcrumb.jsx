import { IoIosArrowForward } from "react-icons/io";
import { Link } from "@inertiajs/react";

import { RiStackLine } from "react-icons/ri";

import { FaCirclePlus } from "react-icons/fa6";

export default function Breadcrumb({
    items,
    type,
    url,
    onClick,
    customButton,
    customData,
}) {
    return (
        <div className="pt-6 mx-auto px-8">
            <header className="fi-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="flex items-center text-2xl font-bold text-black sm:text-2xl uppercase tracking-[1px]">
                    <RiStackLine className="mr-4" />{" "}
                    {items[items.length - 1].label}
                </h1>
                <div className="flex flex-wrap items-center justify-start shrink-0 sm:mt-7 lg:mt-0 gap-1">
                    {customButton && customButton}
                    {type === "link" && (
                        <Link
                            href={url}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded shadow-sm focus:outline-none uppercase hover:bg-opacity-80 transition-all duration-200"
                        >
                            <FaCirclePlus size={18} className="mr-2" /> Crear
                            Registro
                        </Link>
                    )}

                    {type === "button" && (
                        <button
                            type="button"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded shadow-sm focus:outline-none uppercase hover:bg-opacity-80 transition-all duration-200"
                            onClick={onClick}
                        >
                            <FaCirclePlus size={18} className="mr-2" />
                            Crear Registro
                        </button>
                    )}
                    {customData && customData}
                </div>
            </header>
        </div>
    );
}
