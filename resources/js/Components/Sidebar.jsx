import React, { useState, useEffect, useRef } from "react";

import { Link, usePage } from "@inertiajs/react";

import {
    RiHome5Line,
    RiProfileLine,
    RiUserVoiceLine,
    RiUserStarFill,
    RiFolderUserLine,
    RiUserLocationLine,
    RiUser2Line,
    RiSettings2Line,
    RiBuilding2Line,
    RiHome4Line,
    RiShieldUserLine,
    RiInformationLine,
    RiCloseCircleLine,
    RiGovernmentLine,
} from "react-icons/ri";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const trigger = useRef(null);
    const sidebar = useRef(null);

    const { roles } = usePage().props;

    return (
        <div>
            <div
                className={`fixed inset-0 bg-slate-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
                    sidebarOpen
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none w-"
                }`}
                aria-hidden="true"
                onClick={() => setSidebarOpen(false)}
            ></div>

            <div
                ref={sidebar}
                className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-screen overflow-y-hidden lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-56 2xl:sidebar-expanded:!w-64 shrink-0 bg-white p-4 transition-all duration-200 ease-in-out overflow-x-hidden border-r-2 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-64"
                } ${sidebarOpen ? "overflow-y-scroll" : ""}`}
            >
                <div className="flex justify-center mb-10 pr-3 sm:px-2 mt-2">
                    <button
                        ref={trigger}
                        className="lg:hidden text-white hover:text-gray-300"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-controls="sidebar"
                        aria-expanded={sidebarOpen}
                    >
                        <RiCloseCircleLine size={25} />
                    </button>
                    <Link href={route("dashboard")} className="text-center">
                        <img
                            src="/static/logo.png"
                            className="w-36"
                            alt="Matiz"
                        />
                    </Link>
                </div>

                <div className="space-y-6">
                    <div>
                        <TitleNav label="General" />
                        <ul className="mt-3">
                            <ItemNav
                                url={route("dashboard")}
                                label="Inicio"
                                icon={RiHome5Line}
                            />
                        </ul>
                    </div>

                    {roles.includes("Centralista") && (
                        <div>
                            <TitleNav label="Centralista" />

                            <ul className="mt-3">
                                <ItemNav
                                    url={route("centralista.index")}
                                    label="Centralista"
                                    icon={RiUserVoiceLine}
                                />
                            </ul>
                        </div>
                    )}

                    {roles.includes("Supervisor") && (
                        <div>
                            <TitleNav label="Supervisor" />

                            <ul className="mt-3">
                                <ItemNav
                                    url={route("supervisor.index")}
                                    label="Supervisor"
                                    icon={RiUserStarFill}
                                />
                            </ul>
                        </div>
                    )}
                    {roles.includes("Guardia") && (
                        <div>
                            <TitleNav label="Guardia" />

                            <ul className="mt-3">
                                <ItemNav
                                    url={route("visit.index")}
                                    label="Bitácoras"
                                    icon={RiFolderUserLine}
                                />
                                <ItemNav
                                    url={route("early_visit.index")}
                                    label="Visitas Anticipadas"
                                    icon={RiUserLocationLine}
                                />
                            </ul>
                        </div>
                    )}
                    {roles.includes("Administrador") && (
                        <div>
                            <TitleNav label="Administración" />

                            <ul className="mt-3">
                                <ItemNav
                                    url={route("house.index")}
                                    label="Casas"
                                    icon={RiHome4Line}
                                />
                                <ItemNav
                                    url={route("round.index")}
                                    label="Rondas QR"
                                    icon={RiShieldUserLine}
                                />
                            </ul>
                        </div>
                    )}

                    {roles.includes("SuperAdministrador") && (
                        <div>
                            <TitleNav label="Super Administrador" />

                            <ul className="mt-3">
                                <ItemNav
                                    url={route("user.index")}
                                    label="Usuarios"
                                    icon={RiUser2Line}
                                />
                                <ItemNav
                                    url={route("company.index")}
                                    label="Empresas"
                                    icon={RiGovernmentLine}
                                />

                                <ItemNav
                                    url={route("complex.index")}
                                    label="Conjuntos"
                                    icon={RiBuilding2Line}
                                />

                                <ItemNav
                                    url={route("setting.index")}
                                    label="Dispositivos Vinculados"
                                    icon={RiSettings2Line}
                                />
                            </ul>
                        </div>
                    )}
                    <div>
                        <TitleNav label="Cuenta" />

                        <ul className="mt-3">
                            <ItemNav
                                url={route("profile.edit")}
                                label="Mi Perfil"
                                icon={RiProfileLine}
                            />

                            <ItemNav
                                url={route("about")}
                                label="Acerca de"
                                icon={RiInformationLine}
                            />
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TitleNav({ label }) {
    return (
        <h3 className="text-xs uppercase text-black font-semibold pl-3">
            <span className="lg:hidden lg:sidebar-expanded:block 2xl:sidebar-expanded:block">
                {label}
            </span>
        </h3>
    );
}

function ItemNav({ url, label, icon, as, method }) {
    const currentPath = window.location;
    const route = currentPath.origin + currentPath.pathname;

    const [active, setActive] = useState("");
    const [activeIcon, setActiveIcon] = useState("text-black");

    useEffect(() => {
        if (
            route == url ||
            route == url + "/create" ||
            route.startsWith(url + "/edit/")
        ) {
            setActive(
                "border-l-4 border-amber-600 text-black bg-amber-200 rounded-md",
            );
            setActiveIcon("text-amber-600");
        }
    }, [route]);

    return (
        <li className={`px-3 py-3 rounded-sm mb-0.5 last:mb-0 ${active}`}>
            <Link
                as={as}
                method={method}
                href={url}
                className={`block truncate transition duration-150`}
            >
                <div className="flex items-center text-black">
                    {React.createElement(icon, {
                        className: "flex-shrink-0 h-5 w-5 " + activeIcon,
                    })}

                    <span className="text-sm text-black font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        {label}
                    </span>
                </div>
            </Link>
        </li>
    );
}
