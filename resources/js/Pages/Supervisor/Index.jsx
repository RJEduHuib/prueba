import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";
import DataTables, { TableButtons } from "@/Components/DataTables";
import Modal from "@/Components/Modal";

import React from "react";
import { ButtonModal, TitleModal } from "@/Utils/Util";
import axios from "axios";

import { RiQrCodeLine } from "react-icons/ri";
import { Html5QrcodeScanner } from "html5-qrcode";

import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import InputLabel from "@/Components/InputLabel";
import { toast } from "react-toastify";
import { scannerTranslator } from "@/Pages/EarlyVisit/Index";

import { createGlobalState } from "react-hooks-global-state";

const initialState = { reload: false };

const { useGlobalState } = createGlobalState(initialState);

import {
    Modal as ModalChakra,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
} from "@chakra-ui/react";

export default function Index({ roles, auth }) {
    const [reload, setReload] = useGlobalState("reload");
    const [open, setOpen] = React.useState(false);
    const [showQr, setShowQr] = React.useState(false);
    const [id, setId] = React.useState(0);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isOpenQR,
        onOpen: onOpenQR,
        onClose: onCloseQR,
    } = useDisclosure();

    const columns = [
        {
            name: "Fecha",
            selector: (row) => row.date_registered_formatted,
            sortable: true,
        },
        {
            name: "Conjunto",
            selector: (row) => row.round.complex.name,
            sortable: true,
        },
        {
            name: "Nombre",
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
                        setId(row.id);
                        onOpen();
                    }}
                />
            ),
        },
    ];

    return (
        <DashboardLayout user={auth.user} roles={roles} title={"Supervisor"}>
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Supervisor",
                        link: route("supervisor.index"),
                    },
                ]}
                customData={<ButtonTools onClick={onOpenQR} />}
            />

            <div className="mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="mx-4 my-4">
                        <DataTables
                            url={route("round_register.list")}
                            columns={columns}
                            reload={reload}
                            filter
                        />
                    </div>
                </div>
            </div>

            <ModalView show={isOpen} onClose={onClose} type="show" id={id} />

            <ModalQR show={isOpenQR} onClose={onCloseQR} />
        </DashboardLayout>
    );
}

function ModalQR({ show, onClose }) {
    const [data, setData] = React.useState([]);

    const [description, setDescription] = React.useState("");
    const [onAction, setOnAction] = React.useState(false);
    const [reload, setReload] = useGlobalState("reload");

    const saveRound = () => {
        setOnAction(true);
        setReload(false);

        axios
            .post(route("round_register.create", data), {
                description: description,
            })
            .then((response) => {
                if (response.data.status) {
                    toast.success(response.data.message);

                    onClose();
                } else {
                    toast.error(response.data.message);
                }
            })
            .finally(() => {
                setOnAction(false);
                setReload(true);
            });
    };

    React.useEffect(() => {
        setData("");

        if (show) {
            setTimeout(() => {
                const QRScanner = new Html5QrcodeScanner(
                    "reader",
                    {
                        qrbox: {
                            width: 250,
                            height: 250,
                        },
                        rememberLastUsedCamera: true,

                        fps: 5,
                        showTorchButtonIfSupported: true,
                    },
                    true,
                );

                QRScanner.render(success, error);

                function success(result) {
                    QRScanner.clear();
                    setData(result);
                }

                function error(err) {}

                scannerTranslator(document.querySelector("#qr-reader"));
            }, 0);
        }
    }, [show]);

    return (
        <ModalChakra
            isOpen={show}
            onClose={onClose}
            size={"xl"}
            closeOnOverlayClick={false}
        >
            <ModalOverlay />

            <ModalContent>
                <ModalHeader>
                    <h2 className="text-lg font-medium text-gray-900 uppercase">
                        Escanear Código QR
                    </h2>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <div>
                        {data ? (
                            <div>
                                <p className="mt-2 mb-2 text-sm">
                                    Si no tiene observaciones escriba S/N, y de
                                    click en Guardar Ronda.
                                </p>
                                <InputLabel
                                    value="Observaciones"
                                    className="mt-2"
                                />
                                <textarea
                                    className="w-full border rounded-md p-2 mt-2"
                                    rows="4"
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                ></textarea>
                            </div>
                        ) : (
                            <div id="reader"></div>
                        )}

                        <div className="mt-6 flex justify-end mb-2">
                            <SecondaryButton
                                onClick={onClose}
                                disabled={onAction}
                            >
                                Cancelar
                            </SecondaryButton>
                            {data && (
                                <PrimaryButton
                                    className="ml-3"
                                    type="button"
                                    disabled={onAction}
                                    onClick={saveRound}
                                >
                                    Guardar Ronda
                                </PrimaryButton>
                            )}
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </ModalChakra>
    );
}

export function ModalView({ show, onClose, type, id }) {
    const [data, setData] = React.useState([]);

    React.useEffect(() => {
        if (show) {
            axios.get(route("round_register.show", id)).then((response) => {
                setData(response.data.data);
            });
        }
    }, [show]);

    return (
        <ModalChakra
            isOpen={show}
            onClose={onClose}
            size={"2xl"}
            closeOnOverlayClick={false}
        >
            <ModalOverlay />

            <ModalContent>
                <ModalHeader>
                    <TitleModal onClose={onClose} type={type} />
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <form>
                        <div>
                            <div className="w-full overflow-x-auto border text-sm p-2 mt-1">
                                <ItemTable
                                    label="Fecha de registro"
                                    value={data.date_registered_formatted}
                                />
                                <ItemTable
                                    label="Hora de registro"
                                    value={data.time_registered_formatted}
                                />
                                <ItemTable
                                    label="Nombre"
                                    value={
                                        data.user?.name +
                                        " " +
                                        data.user?.surname
                                    }
                                />
                                <ItemTable
                                    label="Observaciónes"
                                    value={
                                        data.description
                                            ? data.description
                                            : "N/A"
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="w-full overflow-x-auto border text-sm p-2 mt-1">
                                <ItemTable
                                    label="Conjunto"
                                    value={data.round?.complex.name}
                                />
                                <ItemTable
                                    label="Dirección"
                                    value={data.round?.complex.address}
                                />
                            </div>
                        </div>

                        <ButtonModal type={type} onClose={onClose} />
                    </form>
                </ModalBody>
            </ModalContent>
        </ModalChakra>
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

function ButtonTools({ onClick }) {
    return (
        <div className="flex">
            <button
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded shadow-sm focus:outline-none uppercase hover:bg-opacity-80 transition-all duration-200"
                onClick={onClick}
            >
                <RiQrCodeLine size={20} className="mr-2" />
                Escanear QR
            </button>
        </div>
    );
}
