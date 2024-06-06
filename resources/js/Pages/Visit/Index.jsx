import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";
import DataTables, { TableLink } from "@/Components/DataTables";
import Modal from "@/Components/Modal";
import React from "react";
import { useForm } from "react-hook-form";

import { VehicleInfoModal, PersonInfoModal } from "@/Components/ModalData";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    ButtonModal,
    DeleteAction,
    ShowAction,
    TitleModal,
} from "@/Utils/Util";
import { RiCameraLine, RiDownloadCloud2Line, RiEye2Line } from "react-icons/ri";
import {
    InputText,
    InputCKEditor,
    InputSelectAsync,
} from "@/Components/InputsForm";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

import InputLabel from "@/Components/InputLabel";

import { createGlobalState } from "react-hooks-global-state";
import { useStore } from "@/Store/ComplexStore";

import { HashLoader } from "react-spinners";

const initialState = { reload: false };

import {
    HouseInfo,
    VechicleInfo,
    CIInfo,
    ViewLayout,
    ItemTable,
    DataNotFound,
} from "@/Pages/Visit/Create";

import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

import { RiGitRepositoryCommitsFill } from "react-icons/ri";

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
import { Link } from "@inertiajs/react";

export default function Index({ roles, auth }) {
    const [reload, setReload] = useGlobalState("reload");

    const [type, setType] = React.useState("create");
    const [id, setId] = React.useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        isOpen: isOpenReport,
        onOpen: onOpenReport,
        onClose: onCloseReport,
    } = useDisclosure();

    const columns = [
        {
            name: "Tipo",
            selector: (row) => row.type_visit,
            sortable: true,
        },
        {
            name: "Conjunto",
            selector: (row) => row.house?.complex.name,
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
                row.house
                    ? row.house?.number_house +
                      " - " +
                      row.house?.owner_name +
                      " " +
                      row.house?.owner_surname
                    : "Sin Casa",
            sortable: true,
        },
        {
            name: "Hora",
            selector: (row) => row.visit_time_formatted,
            sortable: true,
        },

        {
            name: "Acciones",
            cell: (row) => (
                <div className="flex flex-wrap md:items-center md:justify-center gap-2">
                    <a
                        className="text-blue-500 focus:outline-none bg-blue-200 rounded p-1"
                        title="Ver"
                        target={"_blank"}
                        href={row.file_url}
                    >
                        <RiEye2Line size={20} />
                    </a>

                    <a
                        className="text-sky-500 focus:outline-none bg-sky-200 rounded p-1"
                        title="Descargar"
                        href={route("visit.download", row.file_id)}
                        target={"_blank"}
                    >
                        <RiDownloadCloud2Line size={20} />
                    </a>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout user={auth.user} roles={roles} title={"Bitácoras"}>
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Bitácoras",
                        link: route("visit.index"),
                    },
                ]}
                type={"link"}
                url={route("visit.createView")}
                customButton={
                    roles.includes("Administrador") && (
                        <button
                            type="button"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded shadow-sm focus:outline-none uppercase hover:bg-opacity-80 transition-all duration-200 mr-2"
                            onClick={onOpenReport}
                        >
                            <RiGitRepositoryCommitsFill className="mr-2" />
                            Generar Reporte
                        </button>
                    )
                }
            />

            <div className="mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm rounded">
                    <div className="mx-4 my-4">
                        <DataTables
                            url={route("visit.list")}
                            columns={columns}
                            reload={reload}
                            filter
                        />
                    </div>
                </div>
            </div>

            <ActionModal type={type} modal={isOpen} onClose={onClose} id={id} />

            <ReportModal modal={isOpenReport} onClose={onCloseReport} />

            <ToastContainer />
        </DashboardLayout>
    );
}

function ActionModal({ type, modal, onClose, id }) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [reload, setReload] = useGlobalState("reload");
    const complex = useStore((state) => state.complex_id);
    const [key, setKey] = React.useState(0);
    const [fetching, setFetching] = React.useState(false);

    const [modalVehicle, setModalVehicle] = React.useState(false);
    const [modalPerson, setModalPerson] = React.useState(false);

    const [vehicle, setVehicle] = React.useState(null);
    const [person, setPerson] = React.useState(null);
    const [house, setHouse] = React.useState(null);
    const [user, setUser] = React.useState(null);

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
        watch,
    } = useForm({
        defaultValues: {
            visit_date: "",
            visit_time: "",
            description: "",
            visit_images: [],
            vehicle_plate: "",
            visitor_id: "",
            number_visitors: "",
            type_visit: "",
            house_id: "",
        },
    });

    const onSubmit = async (data) => {
        setReload(false);
        setIsLoading(true);

        await DeleteAction(route("visit.destroy", id))
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
            setVehicle(null);
            setPerson(null);
            setHouse(null);
            setUser(null);

            fetchData();
        }
    }, [modal]);

    const fetchData = async () => {
        setFetching(true);

        await ShowAction(route("visit.show", id))
            .then((response) => {
                if (!response.status) {
                    toast.error(response.message);
                } else {
                    console.log(response.data);

                    setValue("house_id", response.data.visit.house_id);
                    setValue("user_id", response.data.visit.user_id);
                    setValue("visit_date", response.data.visit.visit_date);
                    setValue("visit_time", response.data.visit.visit_time);
                    setValue(
                        "description",
                        response.data.visit.description || "",
                    );
                    setValue(
                        "vehicle_plate",
                        response.data.visit.vehicle_plate,
                    );
                    setValue("visitor_id", response.data.visit.visitor_id);
                    setValue(
                        "number_visitors",
                        response.data.visit.number_visitors,
                    );
                    setValue("type_visit", response.data.visit.type_visit);
                    setValue("visit_images", response.data.visit.visit_images);

                    setHouse(response.data.visit.house);
                    setUser(response.data.visit.user);

                    setVehicle(response.data.vehicle);
                    setPerson(response.data.person);
                }
            })
            .finally(() => {
                setFetching(false);
            });
    };

    return (
        <ModalChakra
            isOpen={modal}
            onClose={onClose}
            size={"6xl"}
            closeOnOverlayClick={false}
            maxWidth="2xl"
        >
            <ModalOverlay />

            <ModalContent>
                {fetching ? (
                    <div
                        className={
                            "flex items-center text-center justify-center h-32 w-full absolute bg-white z-50"
                        }
                    >
                        <HashLoader />
                    </div>
                ) : (
                    <>
                        <ModalHeader>
                            <TitleModal onClose={onClose} type={type} />
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody className="pb-4">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {type === "destroy" ? (
                                    <p>
                                        ¿Está seguro de que desea eliminar este
                                        registro?
                                    </p>
                                ) : (
                                    <div>
                                        {watch("visit_images").length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 px-4 pb-4">
                                                <PhotoProvider>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-1 sm:grid-rows-2 gap-4">
                                                        {getValues(
                                                            "visit_images",
                                                        ).map((item, index) => (
                                                            <div className="justify-center flex flex-col items-center">
                                                                <PhotoView
                                                                    src={item}
                                                                >
                                                                    <img
                                                                        src={
                                                                            item
                                                                        }
                                                                        alt="Preview Camera"
                                                                    />
                                                                </PhotoView>

                                                                <div className="flex justify-center text-xs uppercase mt-1">
                                                                    <div className="text-green-500 flex">
                                                                        <div>
                                                                            <RiCameraLine />
                                                                        </div>
                                                                        <div className="ml-2">
                                                                            Cámara{" "}
                                                                            {index +
                                                                                1}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </PhotoProvider>
                                                <div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <InputLabel value="Información de la Casa" />

                                                            {house ? (
                                                                <HouseInfo
                                                                    house={
                                                                        house
                                                                    }
                                                                />
                                                            ) : (
                                                                <DataNotFound />
                                                            )}

                                                            <InputLabel
                                                                value="Información de la Visita"
                                                                className="mt-2"
                                                            />
                                                            {person ? (
                                                                <CIInfo
                                                                    person={
                                                                        person
                                                                    }
                                                                    value={getValues(
                                                                        "visitor_id",
                                                                    )}
                                                                />
                                                            ) : (
                                                                <DataNotFound
                                                                    label="Cédula"
                                                                    input={getValues(
                                                                        "visitor_id",
                                                                    )}
                                                                />
                                                            )}
                                                            <div className="mt-2">
                                                                <InputCKEditor
                                                                    label="Descripción"
                                                                    name="description"
                                                                    control={
                                                                        control
                                                                    }
                                                                    errors={
                                                                        errors
                                                                    }
                                                                    disabled={
                                                                        true
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <InputLabel value="Información del Vehículo" />
                                                            {vehicle ? (
                                                                <VechicleInfo
                                                                    vehicle={
                                                                        vehicle
                                                                    }
                                                                />
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
                                                                    value={getValues(
                                                                        "visit_time",
                                                                    )}
                                                                />
                                                                <ItemTable
                                                                    label="Fecha de la Visita"
                                                                    value={getValues(
                                                                        "visit_date",
                                                                    )}
                                                                />
                                                                <ItemTable
                                                                    label="Número de Visitantes"
                                                                    value={getValues(
                                                                        "number_visitors",
                                                                    )}
                                                                />
                                                                <ItemTable
                                                                    label="Tipo de Visita"
                                                                    value={getValues(
                                                                        "type_visit",
                                                                    )}
                                                                />
                                                            </ViewLayout>

                                                            <div className="mt-2">
                                                                <InputLabel value="Guardia en Turno" />

                                                                <ViewLayout>
                                                                    <ItemTable
                                                                        label="Nombre"
                                                                        value={
                                                                            user &&
                                                                            user.name
                                                                        }
                                                                    />
                                                                    <ItemTable
                                                                        label="Apellido"
                                                                        value={
                                                                            user &&
                                                                            user.surname
                                                                        }
                                                                    />
                                                                    <ItemTable
                                                                        label="Teléfono"
                                                                        value={
                                                                            user &&
                                                                            user.phone
                                                                        }
                                                                    />
                                                                    <ItemTable
                                                                        label="Email"
                                                                        value={
                                                                            user &&
                                                                            user.email
                                                                        }
                                                                    />
                                                                    <ItemTable
                                                                        label="Dirección"
                                                                        value={
                                                                            user &&
                                                                            user.address
                                                                        }
                                                                    />
                                                                    <ItemTable
                                                                        label="Cédula"
                                                                        value={
                                                                            user &&
                                                                            user.ci
                                                                        }
                                                                    />
                                                                </ViewLayout>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 px-4 pb-4">
                                                <div>
                                                    <InputLabel value="Información de la Casa" />

                                                    {house && (
                                                        <HouseInfo
                                                            house={house}
                                                        />
                                                    )}

                                                    <InputLabel
                                                        value="Información de la Visita"
                                                        className="mt-2"
                                                    />
                                                    {person ? (
                                                        <CIInfo
                                                            person={person}
                                                            value={getValues(
                                                                "visitor_id",
                                                            )}
                                                        />
                                                    ) : (
                                                        <DataNotFound
                                                            label="Cédula"
                                                            input={getValues(
                                                                "visitor_id",
                                                            )}
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
                                                    <InputLabel value="Información del Vehiculo" />
                                                    {vehicle ? (
                                                        <VechicleInfo
                                                            vehicle={vehicle}
                                                        />
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
                                                            label="Hora de Visita"
                                                            value={getValues(
                                                                "visit_time",
                                                            )}
                                                        />
                                                        <ItemTable
                                                            label="Fecha de Visita"
                                                            value={getValues(
                                                                "visit_date",
                                                            )}
                                                        />
                                                        <ItemTable
                                                            label="Número de Visitantes"
                                                            value={getValues(
                                                                "number_visitors",
                                                            )}
                                                        />
                                                        <ItemTable
                                                            label="Tipo de Visita"
                                                            value={getValues(
                                                                "type_visit",
                                                            )}
                                                        />
                                                    </ViewLayout>
                                                </div>
                                                <div>
                                                    <InputLabel value="Guardia en Turno" />

                                                    <ViewLayout>
                                                        <ItemTable
                                                            label="Nombre"
                                                            value={
                                                                user &&
                                                                user.name
                                                            }
                                                        />
                                                        <ItemTable
                                                            label="Apellido"
                                                            value={
                                                                user &&
                                                                user.surname
                                                            }
                                                        />
                                                        <ItemTable
                                                            label="Teléfono"
                                                            value={
                                                                user &&
                                                                user.phone
                                                            }
                                                        />
                                                        <ItemTable
                                                            label="Correo Electrónico"
                                                            value={
                                                                user &&
                                                                user.email
                                                            }
                                                        />
                                                        <ItemTable
                                                            label="Dirección"
                                                            value={
                                                                user &&
                                                                user.address
                                                            }
                                                        />
                                                        <ItemTable
                                                            label="Cédula"
                                                            value={
                                                                user && user.ci
                                                            }
                                                        />
                                                    </ViewLayout>
                                                </div>
                                            </div>
                                        )}
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
                    </>
                )}
            </ModalContent>
        </ModalChakra>
    );
}

function ReportModal({ modal, onClose }) {
    const {
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        control,
        setValue,
        getValues,
        clearErrors,
        watch,
    } = useForm({
        defaultValues: {
            date_start: "",
            date_end: "",
        },
    });

    const onSubmit = (data) => {
        console.log(data);

        window.open(route("export_visits", data), "_blank");
    };

    return (
        <ModalChakra
            isOpen={modal}
            onClose={onClose}
            size={"xl"}
            closeOnOverlayClick={false}
        >
            <ModalOverlay />

            <ModalContent>
                <ModalHeader>
                    <h2 className="text-lg font-medium text-gray-900 uppercase">
                        Generar Reporte
                    </h2>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody className="pb-4">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex justify-between"></div>
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4  pb-4">
                                <div>
                                    <InputText
                                        label="Fecha Inicio"
                                        name="date_start"
                                        type="date"
                                        control={control}
                                        errors={errors}
                                        rules={{
                                            required:
                                                "Este campo es obligatorio",
                                        }}
                                    />
                                </div>
                                <div>
                                    <InputText
                                        label="Fecha Fin"
                                        name="date_end"
                                        type="date"
                                        control={control}
                                        errors={errors}
                                        rules={{
                                            required:
                                                "Este campo es obligatorio",
                                        }}
                                    />
                                </div>
                            </div>

                            <InputSelectAsync
                                label="Seleccione el Conjunto Residencial"
                                route={route("complex.select_list")}
                                name="complex_id"
                                control={control}
                                errors={errors}
                                className={"w-full"}
                                rules={{
                                    required: "Este campo es requerido",
                                }}
                            />
                        </div>

                        <div className="mt-6 flex justify-end mb-2">
                            <SecondaryButton onClick={onClose}>
                                Cancelar
                            </SecondaryButton>

                            <PrimaryButton className="ml-3" type="submit">
                                Generar Reporte
                            </PrimaryButton>
                        </div>
                    </form>
                </ModalBody>
            </ModalContent>
        </ModalChakra>
    );
}
