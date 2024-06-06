import { Head } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";

import {
    RiTeamLine,
    RiBuildingLine,
    RiFolderShield2Line,
} from "react-icons/ri";
import React from "react";

import CryptoJS from "crypto-js";

import { Line } from "react-chartjs-2";

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

import { format, parseISO } from "date-fns";
import esLocale from "date-fns/locale/es";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

export default function Dashboard({
    auth,
    roles,
    info,
    visits,
    week_data,
    early_visits,
}) {
    return (
        <DashboardLayout title="Inicio">
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                ]}
            />

            <div className="mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded">
                    <div className="shadow-md p-4">
                        <div className="mx-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <Card
                                    title={"Usuarios"}
                                    icon={RiTeamLine}
                                    value={info.users}
                                />
                                <Card
                                    title={"Conjuntos"}
                                    icon={RiBuildingLine}
                                    value={info.complex}
                                />
                                <Card
                                    title={"Bitácoras"}
                                    icon={RiFolderShield2Line}
                                    value={info.visits}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                                <Chart
                                    title={week_data}
                                    visits={visits}
                                    label="Bitácoras"
                                />
                                <Chart
                                    title={week_data}
                                    visits={early_visits}
                                    label="Visitas Anticipadas"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function Card({ title, icon, value }) {
    return (
        <div className="flex items-center p-4 bg-white rounded border">
            <div className="flex flex-shrink-0 items-center justify-center bg-amber-200 h-16 w-16 rounded">
                {React.createElement(icon, {
                    className: "text-amber-600 h-10 w-10",
                })}
            </div>
            <div className="flex-grow flex flex-col ml-4 h-">
                <span className="text-xl font-bold">{title}</span>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                        Total: {value ? value : "0"}
                    </span>
                </div>
            </div>
        </div>
    );
}

function Chart({ title, visits, label }) {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "none",
                display: false,
            },
            title: {
                display: true,
                text: `${DateFormat(title.startOfWeek)} - ${DateFormat(
                    title.endOfWeek,
                )} | ${label}`,
            },
        },
    };

    const labels = visits.map((visit) => {
        return visit.date;
    });

    const data = {
        labels,
        datasets: [
            {
                label: label,
                data: visits.map((visit) => {
                    return visit.count;
                }),
                fill: false,
                backgroundColor: "#fef3c7",
                borderColor: "#F59E0B",
            },
        ],
    };
    return (
        <div className="flex flex-col mt-4">
            <Line data={data} options={options} />
        </div>
    );
}

function DateFormat(data) {
    const date = parseISO(data);

    const day =
        format(date, "EE", { locale: esLocale }).charAt(0).toUpperCase() +
        format(date, "EE", { locale: esLocale }).slice(1);
    const month =
        format(date, "MMM", { locale: esLocale }).charAt(0).toUpperCase() +
        format(date, "MMM", { locale: esLocale }).slice(1);

    const dayNumber = format(date, "dd", { locale: esLocale });

    return `${day}, ${dayNumber} de ${month}`;
}
