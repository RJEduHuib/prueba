import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";
import DataTables, { TableButtons } from "@/Components/DataTables";

import React from "react";

import { useStore } from "@/Store/ComplexStore";
import Modal from "@/Components/Modal";
import { ModalView } from "@/Pages/Supervisor/Index";
import { TitleModal, ButtonModal } from "@/Utils/Util";

export default function Index({ roles, auth }) {
    const [reload, setReload] = React.useState(false);

    const [showRound, setShowRound] = React.useState(false);
    const [showAlert, setShowAlert] = React.useState(false);
    const [idRound, setIdRound] = React.useState(0);
    const [id, setId] = React.useState(0);

    const columns = [
        {
            name: "Fecha",
            selector: (row) => row.date_registered_formatted,
            sortable: true,
        },
        {
            name: "Conjunto",
            selector: (row) => row.round.complex.name,
        },
        {
            name: "Supervisor",
            selector: (row) => row.user.name + " " + row.user.surname,
            sortable: true,
        },
        {
            name: "Hora",
            selector: (row) => row.time_registered_formatted,
            sortable: true,
        },
        {
            name: "Acciones",
            cell: (row) => (
                <TableButtons
                    onShow={() => {
                        setShowRound(true);
                        setIdRound(row.id);
                    }}
                />
            ),
        },
    ];

    const columns_panic = [
        {
            name: "Fecha",
            selector: (row) => row.date_alerted_formatted,
            sortable: true,
        },
        {
            name: "Conjunto",
            selector: (row) => row.complex.name,
            sortable: true,
        },
        {
            name: "Guardia",
            selector: (row) => row.user.name + " " + row.user.surname,
            sortable: true,
        },
        {
            name: "Hora",
            selector: (row) => row.time_alerted_formatted,
            sortable: true,
        },
        {
            name: "Acciones",
            cell: (row) => (
                <TableButtons
                    onShow={() => {
                        setShowAlert(true);
                        setId(row.id);
                    }}
                />
            ),
        },
    ];

    const storeComplex = useStore((state) => state.setComplexId);
    const complex = useStore((state) => state.complex_id);

    React.useEffect(() => {
        storeComplex(parseInt(localStorage.getItem("complex_id")));

        setReload(!reload);
    }, [complex]);

    return (
        <DashboardLayout user={auth.user} roles={roles} title={"Centralista"}>
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Centralista",
                        link: route("centralista.index"),
                    },
                ]}
            />

            <div className="mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="mx-4 my-4">
                        <div className="flex flex-wrap">
                            <div className="w-full md:w-1/2 p-4">
                                <h1 className="mb-4 text-lg uppercase font-bold">
                                    Control de Rondas
                                </h1>
                                {complex && (
                                    <DataTables
                                        url={route(
                                            "round_register.list_rounds",
                                            complex
                                        )}
                                        columns={columns}
                                        reload={reload}
                                        filter
                                    />
                                )}
                            </div>
                            <div className="w-full md:w-1/2 p-4">
                                <h1 className="mb-4 text-lg uppercase font-bold">
                                    Alertas de Pánico
                                </h1>
                                {complex && (
                                    <DataTables
                                        url={route("panic_alert.list", complex)}
                                        columns={columns_panic}
                                        reload={reload}
                                        filter
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ModalView
                show={showRound}
                onClose={() => setShowRound(false)}
                type={"show"}
                id={idRound}
            />

            <ModalAlert
                show={showAlert}
                onClose={() => setShowAlert(false)}
                type={"show"}
                id={id}
            />
        </DashboardLayout>
    );
}

function ModalAlert({ show, onClose, type, id }) {
    const [dataPanic, setDataPanic] = React.useState([]);

    React.useEffect(() => {
        setDataPanic("");

        if (show) {
            axios
                .get(route("panic_alert.show", id))
                .then((response) => {
                    setDataPanic(response.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [show]);

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form className="p-6">
                <TitleModal type={type} />

                <div className="flex justify-center mt-4 font-bold uppercase">
                    {"la alerta se activo el dia " +
                        dataPanic?.date_alerted_formatted +
                        "  a las " +
                        dataPanic?.time_alerted}
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
                <ButtonModal type={type} onClose={onClose} />
            </form>
        </Modal>
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
