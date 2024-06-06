import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";
import DataTables, { TableButtons } from "@/Components/DataTables";
import Modal from "@/Components/Modal";
import React from "react";
import { useForm } from "react-hook-form";

import {
    InputText,
    InputSelect,
    InputSelectAsync,
} from "@/Components/InputsForm";

import { HashLoader } from "react-spinners";

import {
    TitleModal,
    ButtonModal,
    EditAction,
    CreateAction,
    UpdateAction,
    DeleteAction,
} from "@/Utils/Util";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { createGlobalState } from "react-hooks-global-state";
const initialState = { reload: false };

import Badge from "@/Components/Badges";

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
    const [type, setType] = React.useState("create");
    const [id, setId] = React.useState(null);

    const columns = [
        {
            name: "Conjunto",
            selector: (row) => `${row.complex.name} - ${row.complex.address}`,
            sortable: true,
        },
        {
            name: "Enlace",
            selector: (row) => row.direction_ip,
            sortable: true,
        },
        {
            name: "Número de Cámaras",
            selector: (row) => row.cameras_number,
            sortable: true,
        },
        {
            name: "Estado",
            selector: (row) => (
                <Badge
                    label={row.is_active ? "Activo" : "Inactivo"}
                    type={row.is_active ? "success" : "danger"}
                />
            ),
        },
        {
            name: "Acciones",
            cell: (row) => (
                <TableButtons
                    onEdit={() => {
                        setType("edit");
                        setId(row.id);
                        onOpen();
                    }}
                    onDelete={() => {
                        setType("destroy");
                        setId(row.id);
                        onOpen();
                    }}
                    onShow={() => {
                        setType("show");
                        setId(row.id);
                        onOpen();
                    }}
                />
            ),
        },
    ];

    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <DashboardLayout user={auth.user} roles={roles} title="Ajustes">
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Dispositivos Vinculados",
                        link: route("setting.index"),
                    },
                ]}
                type={"button"}
                onClick={() => {
                    setType("create");
                    setId(null);
                    onOpen();
                }}
            />

            <div className="mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="mx-4 my-4">
                        <DataTables
                            url={route("setting.list")}
                            columns={columns}
                            reload={reload}
                            filter
                        />
                    </div>
                </div>
            </div>

            <ActionModal
                type={type}
                isOpen={isOpen}
                onClose={onClose}
                id={id}
            />

            <ToastContainer />
        </DashboardLayout>
    );
}

function ActionModal({ type, isOpen, onClose, id = 0 }) {
    const {
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        control,
    } = useForm({
        defaultValues: {
            complex_id: "",
            direction_ip: "",
            is_active: "",
            cameras_number: "",
        },
    });

    const [, setReload] = useGlobalState("reload");
    const [isLoading, setIsLoading] = React.useState(false);
    const [disabled, setDisabled] = React.useState(false);
    const [fetching, setFetching] = React.useState(false);

    const onSubmit = async (data) => {
        setReload(false);
        setIsLoading(true);

        switch (type) {
            case "create":
                try {
                    await CreateAction(route("setting.create"), data)
                        .then((response) => {
                            if (!response.status) {
                                Object.keys(response.errors).map((key) => {
                                    setError(key, {
                                        type: "manual",
                                        message: response.errors[key][0],
                                    });
                                });

                                toast.error(response.message);
                            } else {
                                setReload(true);
                                onClose();
                                reset();

                                toast.success(response.message);
                            }
                        })
                        .finally(() => setIsLoading(false));
                } catch (error) {
                    toast.error(error.message);
                    setIsLoading(false);
                }
                break;

            case "edit":
                try {
                    await UpdateAction(route("setting.update", id), data)
                        .then((response) => {
                            if (!response.status) {
                                Object.keys(response.errors).map((key) => {
                                    setError(key, {
                                        type: "manual",
                                        message: response.errors[key][0],
                                    });
                                });

                                toast.error(response.message);
                            } else {
                                setReload(true);
                                onClose();
                                reset();

                                toast.success(response.message);
                            }
                        })
                        .finally(() => setIsLoading(false));
                } catch (error) {
                    toast.error(error.message);
                    setIsLoading(false);
                }

                break;

            case "destroy":
                try {
                    await DeleteAction(route("setting.destroy", id))
                        .then((response) => {
                            if (!response.status) {
                                toast.error(response.message);
                            } else {
                                setReload(true);
                                onClose();
                                reset();

                                toast.success(response.message);
                            }
                        })
                        .finally(() => setIsLoading(false));
                } catch (error) {
                    toast.error(error.message);
                    setIsLoading(false);
                }
                break;
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            setFetching(true);
            if (type === "edit" || type === "show" || type === "destroy") {
                await EditAction(route("setting.show", id))
                    .then((response) => {
                        if (response.status) {
                            reset({
                                complex_id: response.data.complex_id,
                                direction_ip: response.data.direction_ip,
                                is_active: response.data.is_active,
                                cameras_number: response.data.cameras_number,
                            });
                        }
                    })
                    .finally(() => setFetching(false));
            }

            type === "create" && reset();
            setFetching(false);
        };

        reset({});

        isOpen && fetchData();
        isOpen && setDisabled(type === "show" ? true : false);
    }, [isOpen]);

    return (
        <ModalChakra
            isOpen={isOpen}
            onClose={onClose}
            size={"2xl"}
            closeOnOverlayClick={false}
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
                                    <p className="">
                                        ¿Esta seguro que desea eliminar este
                                        registro?
                                    </p>
                                ) : (
                                    <div className="">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-4">
                                            <InputText
                                                label="Dirección de Enlace"
                                                name="direction_ip"
                                                control={control}
                                                errors={errors}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                    pattern: {
                                                        value: /^([0-9]{1,3}\.){3}[0-9]{1,3}$/,
                                                        message:
                                                            "Formato de IP incorrecto",
                                                    },
                                                }}
                                                disabled={disabled}
                                            />

                                            <InputText
                                                label="Número de Cámaras"
                                                name="cameras_number"
                                                type={"number"}
                                                control={control}
                                                errors={errors}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                }}
                                                disabled={disabled}
                                            />

                                            <InputSelect
                                                label="Estado"
                                                name="is_active"
                                                control={control}
                                                errors={errors}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                }}
                                                options={[
                                                    {
                                                        value: 1,
                                                        label: "Activo",
                                                    },
                                                    {
                                                        value: 0,
                                                        label: "Inactivo",
                                                    },
                                                ]}
                                                onChange={(e) => {
                                                    console.log(e);
                                                }}
                                                disabled={disabled}
                                            />

                                            <InputSelectAsync
                                                route={route("complex.select")}
                                                label="Conjunto"
                                                name="complex_id"
                                                control={control}
                                                errors={errors}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                }}
                                                id={id}
                                                disabled={disabled}
                                            />
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
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </ModalChakra>
    );
}
