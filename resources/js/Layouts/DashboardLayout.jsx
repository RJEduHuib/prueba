import React, { useState, useEffect } from "react";
import {
    RiMenu3Fill,
    RiCloseLine,
    RiUser2Line,
    RiHome2Line,
    RiInformationLine,
    RiProfileLine,
    RiHome4Line,
    RiBuilding2Line,
    RiSettings2Line,
    RiShieldUserLine,
    RiUserLocationLine,
    RiFolderUserLine,
    RiAlarmWarningFill,
    RiUserVoiceLine,
    RiUserStarFill,
    RiFileList3Line,
} from "react-icons/ri";

import { IoWarningOutline } from "react-icons/io5";

import { Head, Link } from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";

import { InputSelectAsync } from "@/Components/InputsForm";

import { useForm } from "react-hook-form";

import { useStore } from "@/Store/ComplexStore";

import { ToastContainer, toast } from "react-toastify";
import SweetAlert2 from "react-sweetalert2";
import axios from "axios";

import Modal from "@/Components/Modal";

import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";

import { GetCurrentDate, GetCurrentTime } from "@/Pages/Visit/Create";

export default function DashboardLayout({ title, children, roles, user }) {
    const [sidebar, setSidebar] = useState(false);
    const [show, setShow] = useState(false);
    const [dataPanic, setDataPanic] = useState({});

    const [showPanic, setShowPanic] = useState(false);
    const [disablePanic, setDisablePanic] = useState(false);
    const [showAlert, setShowAlert] = React.useState(false);

    const storeComplex = useStore((state) => state.setComplexId);
    const complex = useStore((state) => state.complex_id);

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

    const onSubmit = (data) => {
        storeComplex(data.complex_id);
        localStorage.setItem("complex_id", data.complex_id);
        toast.success("Conjunto cambiado correctamente");
    };

    useEffect(() => {
        storeComplex(parseInt(localStorage.getItem("complex_id")));

        setValue("complex_id", complex);

        const complexData = parseInt(localStorage.getItem("complex_id"));

        if (complexData) {
            setShow(false);
        } else {
            setShow(true);
        }

        if (complex) {
            setDataPanic({});
            window.Echo.leave(`PanicChannel.${complex}`);

            window.Echo.channel(`PanicChannel.${complex}`).listen(
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
    }, [complex]);

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

    const [showComplex, setShowComplex] = useState(false);
    const [showPanicButton, setShowPanicButton] = useState(false);

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

    const SendPanicEvent = () => {
        setDisablePanic(true);

        const date = GetCurrentDate().split("/").reverse().join("-");

        const data = {
            time: GetCurrentTime(),
            date: date,
        };

        axios
            .post(route("alert.panic", complex ? complex : 0), data)
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
        <div className="min-h-screen grid grid-cols-1 xl:grid-cols-6">
            <Head title={title} />

            <div
                className={`xl:h-[100vh] overflow-y-scroll fixed xl:static lg:static w-[80%] lg:w-full md:w-[40%] h-full top-0 z-50 p-4 flex flex-col justify-between transition-all bg-white ${
                    sidebar ? "-left-0" : "-left-full"
                } border-r bg-red-500`}
            >
                <div className="text-center">
                    <img src="/static/logo.png" className="mx-auto w-36" />
                </div>
                <div className="flex flex-col justify-between h-[800px]">
                    <ul>
                        <SidebarTitle title="General" />
                        <SidebarItem
                            title="Inicio"
                            icon={<RiHome2Line />}
                            url={route("dashboard")}
                        />
                        {roles.includes("Centralista") && (
                            <>
                                <SidebarTitle title="Centralista" />
                                <SidebarItem
                                    title="Centralista"
                                    icon={<RiUserVoiceLine />}
                                    url={route("centralista.index")}
                                />
                            </>
                        )}
                        {roles.includes("Supervisor") && (
                            <>
                                <SidebarTitle title="Supervisor" />
                                <SidebarItem
                                    title="Supervisor"
                                    icon={<RiUserStarFill />}
                                    url={route("supervisor.index")}
                                />
                            </>
                        )}
                        {roles.includes("Guardia") && (
                            <>
                                <SidebarTitle title="Control" />
                                <SidebarItem
                                    title="Bitácoras"
                                    icon={<RiFolderUserLine />}
                                    url={route("visit.index")}
                                />

                                <SidebarItem
                                    title="Visitas Anticipadas"
                                    icon={<RiUserLocationLine />}
                                    url={route("early_visit.index")}
                                />
                            </>
                        )}

                        {roles.includes("Administrador") && (
                            <>
                                <SidebarTitle title="Administración" />
                                <SidebarItem
                                    title="Usuarios"
                                    icon={<RiUser2Line />}
                                    url={route("user.index")}
                                />

                                <SidebarItem
                                    title="Conjuntos"
                                    icon={<RiBuilding2Line />}
                                    url={route("complex.index")}
                                />

                                <SidebarItem
                                    title="Casas"
                                    icon={<RiHome4Line />}
                                    url={route("house.index")}
                                />

                                <SidebarItem
                                    title="Rondas QR"
                                    icon={<RiShieldUserLine />}
                                    url={route("round.index")}
                                />
                                <SidebarItem
                                    title="Dispositivos Vinculados"
                                    icon={<RiSettings2Line />}
                                    url={route("setting.index")}
                                />
                            </>
                        )}

                        <SidebarTitle title="Información" />
                        <SidebarItem
                            title="Perfil"
                            icon={<RiProfileLine />}
                            url={route("profile.edit")}
                        />
                        <SidebarItem
                            title="Acerca de"
                            icon={<RiInformationLine />}
                            url={route("about")}
                        />
                    </ul>
                </div>
            </div>

            <button
                onClick={() => {
                    setSidebar(!sidebar);
                }}
                className="fixed bottom-4 right-4 lg:hidden bg-amber-600 p-2 text-white rounded-full text-2xl focus:outline-none z-50"
            >
                {sidebar ? <RiCloseLine /> : <RiMenu3Fill />}
            </button>

            <div className="xl:col-span-5">
                <header className="flex items-center justify-end p-2 border-b bg-white border-gray">
                    <nav className="flex items-center justify-between gap-2 w-full">
                        <div>
                            {showComplex && (
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <img
                                            src="/static/xito-security.png"
                                            className="mx-auto w-36"
                                        />
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="left" width="56">
                                        <div className="block px-4 py-2 text-sm text-gray-400">
                                            <form
                                                onSubmit={handleSubmit(
                                                    onSubmit,
                                                )}
                                            >
                                                <InputSelectAsync
                                                    route={route(
                                                        "complex.select_list",
                                                    )}
                                                    name="complex_id"
                                                    control={control}
                                                    errors={errors}
                                                    rules={{
                                                        required:
                                                            "Este campo es requerido",
                                                    }}
                                                />

                                                <button
                                                    type="submit"
                                                    className="w-full mt-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                >
                                                    Cambiar
                                                </button>
                                            </form>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            )}
                        </div>
                        <div className="flex">
                            <div className="relative inline-flex items-center">
                                <div className="mr-2 rounded-full">
                                    {showPanicButton && (
                                        <RiAlarmWarningFill
                                            size={32}
                                            onClick={() => setShowPanic(true)}
                                            className="cursor-pointer hover:text-red-800 transition-all text-red-600 "
                                        />
                                    )}
                                </div>
                            </div>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="flex rounded-md items-center">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                        >
                                            <img
                                                className="h-8 w-8 rounded-full object-cover mr-2 hover:text-gray-700 text-sm focus:outline-none transition"
                                                src={user?.profile_photo_url}
                                                alt={user?.name}
                                            />
                                            <div className="flex flex-col">
                                                <span>
                                                    {user?.name +
                                                        " " +
                                                        user?.surname}
                                                </span>
                                                <span className="text-right">
                                                    {user?.roles_names[0]}
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

                                <Dropdown.Content>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                    >
                                        Cerrar sesión
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </nav>
                </header>
                <div className="h-[90vh] sm:fixed md:static sm:overflow-auto md:overflow-y-scroll">
                    <div>{children}</div>
                </div>
            </div>

            <ToastContainer />

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

            <Modal
                maxWidth="md"
                show={show}
                onClose={() => {
                    setShow(false);
                }}
            >
                <div className="p-6">
                    <div className="">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            Por favor, seleccione el conjunto en el que se
                            encuentra
                        </h1>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <InputSelectAsync
                                route={route("complex.select_list")}
                                name="complex_id"
                                control={control}
                                errors={errors}
                                className={"w-full"}
                                rules={{
                                    required: "Este campo es requerido",
                                }}
                            />

                            <button
                                type="submit"
                                className="w-full mt-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Cambiar
                            </button>
                        </form>
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
        </div>
    );
}

function SidebarItem({ title, icon, url }) {
    const currentPath = window.location;
    const route = currentPath.origin + currentPath.pathname;

    const [active, setActive] = useState("");

    useEffect(() => {
        if (
            route == url ||
            route == url + "/create" ||
            route.startsWith(url + "/edit/")
        ) {
            setActive(
                "border-l-4 border-amber-600 text-amber-600 bg-amber-100",
            );
        }
    }, [route]);

    return (
        <li
            className={`hover:border-l-4 border-amber-600 transition-all mb-1 ${active}`}
        >
            <Link
                href={url}
                className={`flex items-center gap-2 px-4 py-1.5 hover:text-amber-600 rounded-lg transition-colors`}
            >
                {icon}
                {title}
            </Link>
        </li>
    );
}

function SidebarTitle({ title }) {
    return (
        <li>
            <h1 className="uppercase font-bold text-gray-400 text-sm gap-4 pl-4 pr-4 my-2">
                {title}
            </h1>
        </li>
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
