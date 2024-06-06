import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";

import React from "react";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

import { FaLaravel, FaReact } from "react-icons/fa";
import { TbBrandInertia } from "react-icons/tb";
import { BiCodeAlt } from "react-icons/bi";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard({ auth, roles }) {
    return (
        <DashboardLayout user={auth.user} roles={roles} title="Acerca de">
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Acerca de Bitaldata",
                        link: route("about"),
                    },
                ]}
            />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="shadow-md p-4">
                        <div className="container mx-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <Card
                                    title={"Laravel"}
                                    icon={FaLaravel}
                                    value={"v10.10"}
                                />

                                <Card
                                    title={"React"}
                                    icon={FaReact}
                                    value={"v18.2.0"}
                                />

                                <Card
                                    title={"Inertia"}
                                    icon={TbBrandInertia}
                                    value={"v0.6.3"}
                                />
                                <Card
                                    title={"Desarrollado por"}
                                    icon={BiCodeAlt}
                                    value={"SJBDevSoft"}
                                />
                            </div>
                        </div>

                        <div className="p-8">
                            <img
                                src="/static/logo.png"
                                alt="Bitaldata"
                                className="w-32"
                            />
                            <h1 className="mt-4 text-lg font-bold">
                                Bitaldata ésta actualizada
                            </h1>
                            <p className="text-bold">
                                <span className="font-bold">v1.2.0 Prod</span>
                            </p>
                            <h1 className="text-lg font-bold mt-8">
                                Información
                            </h1>
                            <p className="mt-4">
                                Bitaldata es nuestra plataforma especializada en
                                el registro y gestión de bitácoras de seguridad
                                de última generación, desarrollada e impulsada
                                por las tecnologías líderes en la industria:
                                Laravel, React e Inertia.js. Está diseñada para
                                simplificar la captura, el análisis y
                                administración de datos empresariales de manera
                                eficiente y efectiva, abordando los desafíos más
                                críticos que enfrentan las organizaciones en
                                términos de seguridad de la información.
                            </p>
                            <p className="mt-4">
                                Descubre cómo BitalData puede simplificar tu
                                gestión de datos y potenciar tu toma de
                                decisiones informadas.
                            </p>
                            <p className="mt-4">
                                Copyright © 2024 Los creadores de BITALDATA.
                                Todos los derechos reservados. Aplicación
                                desarrollada por{" "}
                                <a
                                    href="https://matizstudiocreative.com"
                                    className="underline"
                                >
                                    Matiz Studio Creative
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function Card({ title, icon, value, type = "icon" }) {
    return (
        <div className="flex items-center p-4 bg-white rounded-lg">
            <div className="flex flex-shrink-0 items-center justify-center bg-black h-16 w-16 rounded">
                {type == "icon"
                    ? React.createElement(icon, {
                          className: "text-amber-600 h-10 w-10",
                      })
                    : icon}
            </div>
            <div className="flex-grow flex flex-col ml-4 h-">
                <span className="text-xl font-bold">{title}</span>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">{value ? value : "0"}</span>
                </div>
            </div>
        </div>
    );
}
