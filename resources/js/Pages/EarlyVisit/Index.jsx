import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";
import DataTables, { TableLink } from "@/Components/DataTables";
import Modal from "@/Components/Modal";
import React from "react";
import { useForm } from "react-hook-form";

import { VehicleInfoModal, PersonInfoModal } from "@/Components/ModalData";
import { FaCirclePlus } from "react-icons/fa6";
import InputLabel from "@/Components/InputLabel";
import {
    HouseInfo,
    CIInfo,
    ViewLayout,
    DataNotFound,
    VechicleInfo,
} from "../Visit/Create";
import { Link } from "@inertiajs/react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { RiDownload2Line, RiEye2Line, RiQrCodeLine } from "react-icons/ri";
import Badge from "@/Components/Badges";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    ButtonModal,
    DeleteAction,
    ShowAction,
    TitleModal,
} from "@/Utils/Util";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { RiSearchEyeLine } from "react-icons/ri";
import { InputCKEditor } from "@/Components/InputsForm";
import { createGlobalState } from "react-hooks-global-state";
import { useStore } from "@/Store/ComplexStore";

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
    const [showQr, setShowQr] = React.useState(false);

    const [open, setOpen] = React.useState(false);
    const [type, setType] = React.useState("create");
    const [id, setId] = React.useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isOpenQR,
        onOpen: onOpenQR,
        onClose: onCloseQR,
    } = useDisclosure();

    const columns = [
        {
            name: "Tipo",
            selector: (row) => row.type_visit,
            sortable: true,
        },

        {
            name: "Fecha",
            selector: (row) => row.visit_date_formatted,
            sortable: true,
        },

        {
            name: "Casa",
            selector: (row) =>
                row.house.number_house +
                " - " +
                row.house.owner_name +
                " " +
                row.house.owner_surname,
            sortable: true,
        },
        {
            name: "Hora",
            selector: (row) => row.visit_time_formatted,
            sortable: true,
        },
        {
            name: "Estado",
            selector: (row) => (
                <Badge
                    label={row.pending ? "Pendiente" : "Realizada"}
                    type={row.pending ? "danger" : "success"}
                />
            ),
        },
        {
            name: "Codigo QR",
            cell: (row) => (
                <div className="flex flex-wrap md:items-center md:justify-center gap-2">
                    <a
                        href={row.qr_code}
                        target="_blank"
                        className="text-rose-500 hover:text-rose-700"
                        title="Ver"
                    >
                        <RiEye2Line size={20} />
                    </a>

                    <a
                        href={row.qr_code}
                        target="_blank"
                        download={row.qr_code}
                        className="text-green-500 hover:text-green-700"
                        title="Descargar"
                    >
                        <RiDownload2Line size={20} />
                    </a>
                </div>
            ),
        },
        {
            name: "Acciones",
            cell: (row) => (
                <ActionButton
                    id={row.id}
                    roles={roles}
                    onShow={() => {
                        setType("show");
                        setId(row.id);
                        onOpen();
                    }}
                    onDelete={() => {
                        setId(row.id);
                        setType("destroy");
                        onOpen();
                    }}
                />
            ),
        },
    ];

    return (
        <DashboardLayout
            user={auth.user}
            roles={roles}
            title={"Visitas Anticipadas"}
        >
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Visitas Anticipadas",
                        link: route("early_visit.index"),
                    },
                ]}
                customData={<ButtonTools onClick={onOpenQR} />}
            />

            <div className="mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="mx-4 my-4">
                        <DataTables
                            url={route("early_visit.list")}
                            columns={columns}
                            reload={reload}
                            filter
                        />
                    </div>
                </div>
            </div>

            <QRModal show={isOpenQR} onClose={onCloseQR} />
            <ActionModal type={type} modal={isOpen} onClose={onClose} id={id} />

            <ToastContainer />
        </DashboardLayout>
    );
}

function ActionModal({ type, modal, onClose, id }) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [reload, setReload] = useGlobalState("reload");
    const complex = useStore((state) => state.complex_id);
    const [key, setKey] = React.useState(0);

    const [house, setHouse] = React.useState(null);
    const [user, setUser] = React.useState(null);

    const [modalVehicle, setModalVehicle] = React.useState(false);
    const [modalPerson, setModalPerson] = React.useState(false);

    const [vehicle, setVehicle] = React.useState(null);
    const [person, setPerson] = React.useState(null);

    const [submit, setSubmit] = React.useState(false);
    const {
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        control,
        setValue,
        getValues,
        clearErrors,
    } = useForm({
        defaultValues: {
            house_id: "",
            user_id: "",
            visit_date: "",
            visit_time: "",
            description: "",
            vehicle_plate: "",
            visitor_ci: "",
            number_visitors: "",
            type_visit: "",
        },
    });

    const onSubmit = async (data) => {
        setReload(false);
        setIsLoading(true);

        await DeleteAction(route("early_visit.destroy", id))
            .then((response) => {
                if (!response.status) {
                    toast.error(response.message);
                } else {
                    setReload(true);
                    onClose();
                    toast.success(response.message);
                }
            })
            .finally(() => setIsLoading(false));
    };

    React.useEffect(() => {
        setKey((prevKey) => prevKey + 1);
    }, [complex]);

    React.useEffect(() => {
        if (modal) {
            fetchData();
        }
    }, [modal]);

    const fetchData = async () => {
        await ShowAction(route("early_visit.show", id)).then((response) => {
            if (!response.status) {
                toast.error(response.message);
            } else {
                setValue("house_id", response.data.visit.house_id);
                setValue("user_id", response.data.visit.user_id);
                setValue("visit_date", response.data.visit.visit_date);
                setValue("visit_time", response.data.visit.visit_time);
                setValue("description", response.data.visit.description || "");
                setValue("vehicle_plate", response.data.visit.vehicle_plate);
                setValue("visitor_ci", response.data.visit.visitor_ci);
                setValue(
                    "number_visitors",
                    response.data.visit.number_visitors,
                );
                setValue("type_visit", response.data.visit.type_visit);

                setHouse(response.data.visit.house);
                setUser(response.data.visit.user);
                setVehicle(response.data.vehicle);
                setPerson(response.data.person);
            }
        });
    };

    return (
        <ModalChakra
            isOpen={modal}
            onClose={onClose}
            size={"5xl"}
            closeOnOverlayClick={false}
        >
            <ModalOverlay />

            <ModalContent>
                <ModalHeader>
                    <TitleModal onClose={onClose} type={type} />
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody className="pb-4">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {type === "destroy" ? (
                            <p>
                                ¿Esta seguro que desea eliminar este registro?
                            </p>
                        ) : (
                            <div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 px-4 pb-4">
                                    <div>
                                        <InputLabel value="Información de la Casa" />

                                        {house && <HouseInfo house={house} />}

                                        <InputLabel
                                            value="Información de la Visita"
                                            className="mt-2"
                                        />

                                        {person ? (
                                            <CIInfo person={person} />
                                        ) : (
                                            <DataNotFound
                                                label="Cédula"
                                                input={getValues("visitor_ci")}
                                            />
                                        )}

                                        <div className="mt-2">
                                            <InputCKEditor
                                                label="Descripción"
                                                name="description"
                                                control={control}
                                                errors={errors}
                                                disabled={true}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel value="Información del Vehículo" />

                                        {vehicle ? (
                                            <VechicleInfo vehicle={vehicle} />
                                        ) : (
                                            <DataNotFound
                                                label="Placa"
                                                input={getValues(
                                                    "vehicle_plate",
                                                )}
                                            />
                                        )}

                                        <InputLabel
                                            value="Información Principal"
                                            className="mt-2"
                                        />

                                        <ViewLayout>
                                            <ItemTable
                                                label="Hora de la Visita"
                                                value={getValues("visit_time")}
                                            />
                                            <ItemTable
                                                label="Fecha de la Visita"
                                                value={getValues("visit_date")}
                                            />
                                            <ItemTable
                                                label="Número de Visitantes"
                                                value={getValues(
                                                    "number_visitors",
                                                )}
                                            />
                                            <ItemTable
                                                label="Tipo de Visita"
                                                value={getValues("type_visit")}
                                            />
                                        </ViewLayout>
                                    </div>
                                    <div>
                                        <InputLabel value="Guardia en Turno" />

                                        <ViewLayout>
                                            <ItemTable
                                                label="Nombre"
                                                value={user && user.name}
                                            />
                                            <ItemTable
                                                label="Apellido"
                                                value={user && user.surname}
                                            />
                                            <ItemTable
                                                label="Teléfono"
                                                value={user && user.phone}
                                            />
                                            <ItemTable
                                                label="Email"
                                                value={user && user.email}
                                            />
                                            <ItemTable
                                                label="Dirección"
                                                value={user && user.address}
                                            />
                                            <ItemTable
                                                label="Cédula"
                                                value={user && user.ci}
                                            />
                                        </ViewLayout>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ButtonModal
                            type={type}
                            onClose={() => {
                                onClose();
                                reset();
                            }}
                            onSubmit={isLoading}
                        />
                    </form>

                    <VehicleInfoModal
                        modal={modalVehicle}
                        onClose={() => setModalVehicle(false)}
                        vehicle={vehicle}
                        title={"Datos del Vehículo"}
                    />

                    <PersonInfoModal
                        modal={modalPerson}
                        onClose={() => setModalPerson(false)}
                        person={person}
                        title={"Datos de la Persona"}
                    />
                </ModalBody>
            </ModalContent>
        </ModalChakra>
    );
}

function ActionButton({ id, roles, onShow, onDelete }) {
    return (
        <>
            {roles.includes("Administrador") ? (
                <TableLink
                    onShow={onShow}
                    urlEdit={route("early_visit.editView", id)}
                    onDelete={onDelete}
                />
            ) : (
                <TableLink onShow={onShow} />
            )}
        </>
    );
}

function ButtonTools({ onClick }) {
    return (
        <div className="flex">
            <button
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded shadow-sm focus:outline-none uppercase hover:bg-opacity-80 transition-all duration-200 mr-2"
                onClick={onClick}
            >
                <RiQrCodeLine size={20} className="mr-2" />
                Escanear QR
            </button>
            <Link
                href={route("early_visit.createView")}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded shadow-sm focus:outline-none uppercase hover:bg-opacity-80 transition-all duration-200"
            >
                <FaCirclePlus size={18} className="mr-2" />
                Crear registro
            </Link>
        </div>
    );
}

function QRModal({ show, onClose }) {
    const [data, setData] = React.useState("");
    const [dataVisit, setDataVisit] = React.useState();

    const [reload, setReload] = useGlobalState("reload");
    const [onAction, setOnAction] = React.useState(false);

    const updateVisit = () => {
        setReload(false);
        setOnAction(true);

        axios
            .get(route("early_visit.approve", data))
            .then((response) => {
                if (response.data.status) {
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                }
            })
            .finally(() => {
                setReload(true);
                onClose();
                setOnAction(false);
            });
    };

    const viewVisit = (result) => {};

    React.useEffect(() => {
        if (show) {
            setData(null);
            setDataVisit(null);

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

                    axios
                        .get(route("early_visit.show", result))
                        .then((response) => {
                            setDataVisit(response.data.data);
                        });
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
                    <h2 className="text-lg font-medium text-gray-900">
                        Escanear Código QR
                    </h2>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <div>
                        {data ? (
                            dataVisit ? (
                                <div>
                                    {dataVisit.visit?.pending == 0 && (
                                        <div className="mt-6">
                                            <div className="w-full overflow-x-auto border text-sm p-2 mt-1">
                                                <p>
                                                    La visita ya fue realizada
                                                    anteriormente, por lo tanto
                                                    no se puede volver a
                                                    realizar.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6">
                                        <div className="w-full overflow-x-auto border text-sm p-2 mt-1">
                                            <h1 className="text-md uppercase font-bold">
                                                Información de la Visita
                                            </h1>

                                            <ItemTable
                                                label={"Casa"}
                                                value={
                                                    dataVisit.visit?.house
                                                        ?.number_house
                                                }
                                            />

                                            <ItemTable
                                                label={"Propietario"}
                                                value={
                                                    dataVisit.visit?.house
                                                        ?.owner_name +
                                                    " " +
                                                    dataVisit.visit?.house
                                                        ?.owner_surname
                                                }
                                            />

                                            <ItemTable
                                                label={"Tipo de Visita"}
                                                value={
                                                    dataVisit.visit?.type_visit
                                                }
                                            />

                                            <ItemTable
                                                label={"Estado"}
                                                value={
                                                    dataVisit.visit?.pending ==
                                                    1
                                                        ? "Pendiente"
                                                        : "Realizada"
                                                }
                                            />

                                            <ItemTable
                                                label={"Número de Visitantes"}
                                                value={
                                                    dataVisit.visit
                                                        ?.number_visitors
                                                }
                                            />

                                            <ItemTable
                                                label={"Fecha"}
                                                value={
                                                    dataVisit.visit
                                                        ?.visit_date_formatted
                                                }
                                            />

                                            <ItemTable
                                                label={"Hora"}
                                                value={
                                                    dataVisit.visit
                                                        ?.visit_time_formatted
                                                }
                                            />

                                            <ItemTable
                                                label={"Cédula del Visitante"}
                                                value={
                                                    dataVisit.visit?.visitor_ci
                                                }
                                            />

                                            <ItemTable
                                                label="Placa del Vehículo "
                                                value={
                                                    dataVisit.visit
                                                        ?.vehicle_plate
                                                        ? dataVisit.visit
                                                              ?.vehicle_plate
                                                        : "N/A"
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6">
                                    <div className="w-full overflow-x-auto border text-sm p-2 mt-1">
                                        <p>Cargando...</p>
                                    </div>
                                </div>
                            )
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
                            {dataVisit && dataVisit.visit?.pending == 1 && (
                                <PrimaryButton
                                    className="ml-3"
                                    type="button"
                                    onClick={updateVisit}
                                    disabled={onAction}
                                >
                                    Aprobar Visita
                                </PrimaryButton>
                            )}
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </ModalChakra>
    );
}

export function scannerTranslator() {
    const traducciones = [
        {
            original: "QR code parse error, error =",
            traduccion: "Error al analizar el código QR, error =",
        },
        {
            original: "Error getting userMedia, error =",
            traduccion: "Error al obtener userMedia, error =",
        },
        {
            original:
                "The device doesn't support navigator.mediaDevices , only supported cameraIdOrConfig in this case is deviceId parameter (string).",
            traduccion:
                "El dispositivo no admite navigator.mediaDevices, en este caso sólo se admite cameraIdOrConfig como parámetro deviceId (cadena).",
        },
        {
            original: "Camera streaming not supported by the browser.",
            traduccion: "El navegador no admite la transmisión de la cámara.",
        },
        {
            original: "Unable to query supported devices, unknown error.",
            traduccion:
                "No se puede consultar los dispositivos compatibles, error desconocido.",
        },
        {
            original:
                "Camera access is only supported in secure context like https or localhost.",
            traduccion:
                "El acceso a la cámara sólo es compatible en un contexto seguro como https o localhost.",
        },
        { original: "Scanner paused", traduccion: "Escáner en pausa" },

        { original: "Scanning", traduccion: "Escaneando" },
        { original: "Idle", traduccion: "Inactivo" },
        { original: "Error", traduccion: "Error" },
        { original: "Permission", traduccion: "Permiso" },
        { original: "No Cameras", traduccion: "Sin cámaras" },
        { original: "Last Match:", traduccion: "Última coincidencia:" },
        { original: "Code Scanner", traduccion: "Escáner de código" },
        {
            original: "Request Camera Permissions",
            traduccion: "Solicitar permisos de cámara",
        },
        {
            original: "Requesting camera permissions...",
            traduccion: "Solicitando permisos de cámara...",
        },
        {
            original: "No camera found",
            traduccion: "No se encontró ninguna cámara",
        },
        { original: "Stop Scanning", traduccion: "Detener escaneo" },
        { original: "Start Scanning", traduccion: "Iniciar escaneo" },
        { original: "Switch On Torch", traduccion: "Encender linterna" },
        { original: "Switch Off Torch", traduccion: "Apagar linterna" },
        {
            original: "Failed to turn on torch",
            traduccion: "Error al encender la linterna",
        },
        {
            original: "Failed to turn off torch",
            traduccion: "Error al apagar la linterna",
        },
        { original: "Launching Camera...", traduccion: "Iniciando cámara..." },
        {
            original: "Scan an Image File",
            traduccion: "Escanear un archivo de imagen",
        },
        {
            original: "Scan using camera directly",
            traduccion: "Escanear usando la cámara directamente",
        },
        { original: "Select Camera", traduccion: "Seleccionar cámara" },
        { original: "Choose Image", traduccion: "Elegir imagen" },
        { original: "Choose Another", traduccion: "Elegir otra" },
        {
            original: "No image choosen",
            traduccion: "Ninguna imagen seleccionada",
        },
        { original: "Anonymous Camera", traduccion: "Cámara anónima" },
        {
            original: "Or drop an image to scan",
            traduccion: "O arrastra una imagen para escanear",
        },
        {
            original: "Or drop an image to scan (other files not supported)",
            traduccion:
                "O arrastra una imagen para escanear (otros archivos no soportados)",
        },
        { original: "zoom", traduccion: "zoom" },
        { original: "Loading image...", traduccion: "Cargando imagen..." },
        {
            original: "Camera based scan",
            traduccion: "Escaneo basado en cámara",
        },
        {
            original: "Fule based scan",
            traduccion: "Escaneo basado en archivo",
        },

        { original: "Powered by ", traduccion: "Desarrollado por " },
        { original: "Report issues", traduccion: "Informar de problemas" },

        {
            original: "NotAllowedError: Permission denied",
            traduccion: "Permiso denegado para acceder a la cámara",
        },
        {
            original: "Select Camera",
            traduccion: "Seleccionar cámara",
        },
    ];

    function traducirTexto(texto) {
        const traduccion = traducciones.find((t) => t.original === texto);
        return traduccion ? traduccion.traduccion : texto;
    }

    function traducirNodosDeTexto(nodo) {
        if (nodo.nodeType === Node.TEXT_NODE) {
            nodo.textContent = traducirTexto(nodo.textContent.trim());
        } else {
            for (let i = 0; i < nodo.childNodes.length; i++) {
                traducirNodosDeTexto(nodo.childNodes[i]);
            }
        }
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((nodo) => {
                    traducirNodosDeTexto(nodo);
                });
            }
        });
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);

    traducirNodosDeTexto(document.body);
}

function ItemTable({ label, value }) {
    return (
        <div className="py-0.5 px-0.5">
            <span className="font-bold mr-1">{label}:</span>
            <span>{value}</span>
        </div>
    );
}
