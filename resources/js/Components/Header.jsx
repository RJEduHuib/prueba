import React, { useState, useEffect } from "react";

import Dropdown from "@/Components/Dropdown";
import { usePage } from "@inertiajs/react";
import { useForm } from "react-hook-form";
import {
    RiDoorOpenLine,
    RiArrowRightSLine,
    RiAlarmWarningFill,
    RiDoorClosedLine,
} from "react-icons/ri";

import { HiMiniBars3 } from "react-icons/hi2";
import { toast } from "react-toastify";
import Modal from "@/Components/Modal";
import { IoWarningOutline } from "react-icons/io5";

import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { GetCurrentDate, GetCurrentTime } from "@/Pages/Visit/Create";

export default function Header({ sidebarOpen, setSidebarOpen }) {
    const [open, setOpen] = useState(false);
    const [showPanic, setShowPanic] = useState(false);
    const [showComplex, setShowComplex] = useState(true);
    const page = usePage().props;
    const [show, setShow] = useState(false);
    const [dataPanic, setDataPanic] = useState({});
    const [disablePanic, setDisablePanic] = useState(false);
    const [showAlert, setShowAlert] = React.useState(false);
    const [showPanicButton, setShowPanicButton] = useState(false);

    const {
        handleSubmit,
        formState: { errors },
        control,
        setValue,
    } = useForm({
        defaultValues: {
            complex_id: "",
        },
    });

    useEffect(() => {
        if (page.complex.id) {
            setDataPanic({});
            window.Echo.leave(`PanicChannel.${page.complex.id}`);

            window.Echo.channel(`PanicChannel.${page.complex.id}`).listen(
                ".PanicEvent",
                (event) => {
                    if (roles.includes("Centralista")) {
                        setShowAlert(true);
                        NotificationPanic(event.data.complex.name);
                        console.log(event.data);
                        setDataPanic(event.data);
                    }
                },
            );
        }
    }, []);

    const NotificationPanic = (complex) => {
        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                new Notification("Alerta de pánico", {
                    body:
                        "Se ha activado el botón de pánico en el conjunto " +
                        complex,
                    icon: "icon.png",
                });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(function (permission) {
                    if (permission === "granted") {
                        new Notification("Alerta de pánico", {
                            body:
                                "Se ha activado el botón de pánico en el conjunto " +
                                complex,
                            icon: "icon.png",
                        });
                    }
                });
            }
        }
    };

    const getCurrentUrl = () => {
        const currentPath = window.location;
        const currentRoute = currentPath.origin + currentPath.pathname;

        const url = route("early_visit.index");
        const url2 = route("visit.index");

        currentRoute == route("centralista.index")
            ? setShowPanicButton(false)
            : setShowPanicButton(true);

        if (
            currentRoute == route("early_visit.index") ||
            currentRoute == route("early_visit.createView") ||
            currentRoute.startsWith(url + "/edit/") ||
            currentRoute == route("visit.index") ||
            currentRoute == route("visit.createView") ||
            currentRoute.startsWith(url2 + "/edit/") ||
            currentRoute == route("centralista.index")
        ) {
            setShowComplex(true);
        } else {
            setShowComplex(false);
        }
    };

    React.useEffect(() => {
        getCurrentUrl();
    }, []);

    const toogleSidebar = () => {
        setOpen(!open);
        document.body.classList.toggle("sidebar-expanded");
    };

    const SendPanicEvent = () => {
        setDisablePanic(true);

        const date = GetCurrentDate().split("/").reverse().join("-");

        const data = {
            time: GetCurrentTime(),
            date: date,
        };

        axios
            .post(
                route("alert.panic", page.complex.id ? page.complex.id : 0),
                data,
            )
            .then((response) => {
                if (response.data.status) {
                    toast.success("Botón de pánico activado correctamente");
                } else {
                    toast.error("Error al activar el botón de pánico");
                }
            })
            .finally(() => {
                setShowPanic(false);
                setDisablePanic(false);
            });
    };

    return (
        <>
            <Modal
                show={showPanic}
                onClose={() => setShowPanic(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <div className="flex flex-col items-center">
                        <IoWarningOutline className="text-6xl text-red-500 mb-4" />
                        <h1 className="text-xl uppercase font-bold text-gray-800 mb-4">
                            BOTÓN DE PÁNICO
                        </h1>

                        <p className="text-gray-800 mb-4 text-center text-md">
                            <p className="font-bold">
                                ¿Está seguro de que desea activar el botón de
                                pánico?
                            </p>
                            Esto notificará al encargado de la central.
                        </p>

                        <div className="flex gap-4">
                            <SecondaryButton
                                type="button"
                                onClick={() => setShowPanic(false)}
                                disabled={disablePanic}
                            >
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton
                                onClick={SendPanicEvent}
                                type="button"
                                disabled={disablePanic}
                                className="bg-red-500 hover:bg-red-700 focus:ring-red-500 focus:bg-red-700 active:bg-red-700"
                            >
                                Activar
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>

            {dataPanic && (
                <Modal
                    show={showAlert}
                    onClose={() => setShowAlert(false)}
                    maxWidth="md"
                >
                    <div className="p-6">
                        <div className="flex flex-col items-center">
                            <IoWarningOutline className="text-6xl text-red-500 mb-4" />
                            <h1 className="text-xl uppercase font-bold text-gray-800 mb-4">
                                ALERTA DE PÁNICO
                            </h1>
                        </div>

                        <div className="flex justify-center font-bold uppercase">
                            {dataPanic.info?.date_alerted_formatted +
                                "  a las " +
                                dataPanic.info?.time_alerted}
                        </div>
                        <div className="mt-6">
                            <div className="w-full overflow-x-auto border text-sm p-2 mt-1">
                                <h1 className="text-md uppercase font-bold">
                                    Información del conjunto
                                </h1>
                                <ItemTable
                                    label="Nombre"
                                    value={dataPanic.complex?.name}
                                />
                                <ItemTable
                                    label="Dirección"
                                    value={dataPanic.complex?.address}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="w-full overflow-x-auto border text-sm p-2 mt-1">
                                <h1 className="text-md uppercase font-bold">
                                    Información del guardia
                                </h1>
                                <ItemTable
                                    label="Nombre"
                                    value={
                                        dataPanic.user?.name +
                                        " " +
                                        dataPanic.user?.surname
                                    }
                                />
                                <ItemTable
                                    label="Teléfono"
                                    value={dataPanic.user?.phone}
                                />
                                <ItemTable
                                    label="Cédula de identidad"
                                    value={dataPanic.user?.ci}
                                />
                            </div>
                        </div>

                        <SecondaryButton
                            onClick={() => setShowAlert(false)}
                            className="mt-6"
                        >
                            Cerrar
                        </SecondaryButton>
                    </div>
                </Modal>
            )}

            <header className="sticky top-0 bg-white z-30">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 -mb-px">
                        <div className="flex gap-4">
                            <div className="hidden lg:flex lg:items-center gap-4">
                                <button
                                    className="text-alc-dark hover:text-alc-dark/70 focus:outline-none active:outline-none transition-transform duration-300 transform hover:scale-110"
                                    onClick={(e) => {
                                        toogleSidebar();
                                    }}
                                >
                                    <div
                                        className={`${
                                            open ? "hidden" : "block"
                                        }`}
                                    >
                                        <HiMiniBars3 className="w-6 h-6 fill-current" />
                                    </div>
                                    <div
                                        className={`${
                                            open ? "block" : "hidden"
                                        }`}
                                    >
                                        <RiArrowRightSLine className="w-6 h-6 fill-current" />
                                    </div>
                                </button>
                            </div>

                            <img
                                src={page.company.logo_url}
                                className="mx-auto w-36"
                            />
                        </div>

                        <div className="flex">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="flex rounded-md items-center">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150 text-center"
                                        >
                                            <img
                                                className="h-8 w-8 rounded-full object-cover mr-2 hover:text-gray-700 text-sm focus:outline-none transition"
                                                src={
                                                    page.auth.user
                                                        .profile_photo_url
                                                }
                                                alt={page.auth.user.name}
                                            />

                                            <div className="flex flex-col">
                                                <span>
                                                    {page.auth.user?.name +
                                                        " " +
                                                        page.auth.user?.surname}
                                                </span>
                                                <span className="text-center md:text-right">
                                                    {
                                                        page.auth.user
                                                            ?.roles_names[0]
                                                    }
                                                </span>
                                            </div>

                                            <svg
                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content contentClasses="bg-white rounded-none">
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                    >
                                        <div className="flex items-center">
                                            <RiDoorOpenLine className="mr-4" />
                                            Cerrar Sesión
                                        </div>
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                <div className="sm:px-2 lg:px-2 border-t-2">
                    <div className={"flex justify-center md:justify-between"}>
                        <div className={"hidden md:block"}>
                            <div
                                className={
                                    "flex flex-row items-center py-[8px] px-4"
                                }
                            >
                                <p
                                    className={
                                        "text-black font-bold text-black"
                                    }
                                >
                                    Urbanización:
                                </p>
                                <p className={"ml-1 text-black"}>
                                    {page.complex.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-end">
                            <div className="flex">
                                <button className="flex bg-green-900 py-[8px] px-4 text-white text-sm">
                                    <RiDoorClosedLine
                                        className="text-white mr-1"
                                        size={18}
                                    />
                                    <span>Entrada</span>
                                </button>
                                <button className="flex bg-blue-900 py-[8px] px-4 text-white text-sm">
                                    <RiDoorOpenLine
                                        className="text-white mr-1"
                                        size={18}
                                    />
                                    <span>Salida</span>
                                </button>
                                <button
                                    className="flex bg-red-600 py-[8px] px-4 text-white text-sm"
                                    onClick={() => setShowPanic(true)}
                                >
                                    <RiAlarmWarningFill
                                        className="text-white mr-1"
                                        size={18}
                                    />
                                    <span>Panico</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}

function ItemTable({ label, value }) {
    return (
        <div className="py-0.5 px-0.5">
            <span className="font-bold mr-1">{label}:</span>
            <span>{value}</span>
        </div>
    );
}
