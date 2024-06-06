import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";
import DataTables, { TableButtons } from "@/Components/DataTables";
import React from "react";
import { useForm } from "react-hook-form";
import { InputSelectAsync } from "@/Components/InputsForm";
import { InputText, InputCheckBox } from "@/Components/InputsForm";

import { TitleModal, ButtonModal, EditAction } from "@/Utils/Util";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { createGlobalState } from "react-hooks-global-state";

import Badge from "@/Components/Badges";

const initialState = { reload: false };

const { useGlobalState } = createGlobalState(initialState);

import { HashLoader } from "react-spinners";

import {
    Modal as ModalChakra,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
} from "@chakra-ui/react";
export default function Index({ roles, auth }) {
    const [reload, setReload] = useGlobalState("reload");

    const [open, setOpen] = React.useState(false);
    const [type, setType] = React.useState("create");
    const [id, setId] = React.useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const columns = [
        {
            name: "Ciudad",
            selector: (row) => row.city,
            sortable: true,
        },
        {
            name: "Nombre",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Dirección",
            selector: (row) => row.address,
            sortable: true,
        },
        {
            name: "Cámaras",
            selector: (row) => (
                <Badge
                    label={row.is_cameras ? "Si" : "No"}
                    type={row.is_cameras ? "success" : "danger"}
                />
            ),
            sortable: true,
        },
        {
            name: "WhatsApp",
            selector: (row) => (
                <Badge
                    label={row.is_whatsapp ? "Si" : "No"}
                    type={row.is_whatsapp ? "success" : "danger"}
                />
            ),
            sortable: true,
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

    return (
        <DashboardLayout user={auth.user} roles={roles} title={"Conjuntos"}>
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Conjuntos",
                        link: route("complex.index"),
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
                            url={route("complex.list")}
                            columns={columns}
                            reload={reload}
                            filter
                        />
                    </div>
                </div>
            </div>

            <ActionModal type={type} modal={isOpen} onClose={onClose} id={id} />

            <ToastContainer />
        </DashboardLayout>
    );
}

function ActionModal({ type, modal, onClose, id }) {
    const {
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        control,
        setValue,
    } = useForm({
        defaultValues: {
            name: "",
            address: "",
            city: "",
            is_cameras: false,
            is_whatsapp: false,
            is_outomatisering: false,
            admin_email: "",
            company_id: "",
            user_id: "",
        },
    });

    const [, setReload] = useGlobalState("reload");
    const [isLoading, setIsLoading] = React.useState(false);
    const [disabled, setDisabled] = React.useState(false);
    const [fetching, setFetching] = React.useState(false);

    const onSubmit = (data) => {
        switch (type) {
            case "create":
                setReload(false);
                setIsLoading(true);

                axios
                    .post(route("complex.create", data))
                    .then((response) => {
                        if (!response.data.status) {
                            Object.keys(response.data.errors).forEach(
                                (error) => {
                                    setError(error, {
                                        type: "manual",
                                        message: response.errors[error][0],
                                    });
                                },
                            );

                            toast.error(response.data.message);
                        } else {
                            setReload(true);
                            onClose();
                            reset();

                            toast.success(response.data.message);
                        }
                    })
                    .finally(() => setIsLoading(false));

                break;

            case "edit":
                setReload(false);
                setIsLoading(true);

                axios
                    .post(route("complex.update", id), data)
                    .then((response) => {
                        if (!response.data.status) {
                            Object.keys(response.data.errors).forEach(
                                (error) => {
                                    setError(error, {
                                        type: "manual",
                                        message: response.errors[error][0],
                                    });
                                },
                            );

                            toast.error(response.data.message);
                        } else {
                            setReload(true);
                            onClose();
                            reset();

                            toast.success(response.data.message);
                        }
                    })
                    .finally(() => setIsLoading(false));

                break;

            case "destroy":
                setReload(false);
                setIsLoading(true);

                axios
                    .delete(route("complex.destroy", id))
                    .then((response) => {
                        if (!response.data.status) {
                            toast.error(response.data.message);
                        } else {
                            setReload(true);
                            onClose();
                            reset();

                            toast.success(response.data.message);
                        }
                    })
                    .finally(() => setIsLoading(false));

                break;
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            setFetching(true);
            if (type == "edit" || type == "show") {
                await EditAction(route("complex.show", id))
                    .then((response) => {
                        reset({
                            name: response.data.name,
                            address: response.data.address,
                            city: response.data.city,
                            is_cameras: response.data.is_cameras,
                            is_whatsapp: response.data.is_whatsapp,
                            is_outomatisering: response.data.is_outomatisering,
                            admin_email: response.data.admin_email,
                            company_id: response.data.company_id,
                            user_id: response.data.user_id,
                        });
                    })
                    .finally(() => setFetching(false));
            }

            type === "create" && reset({});
            setFetching(false);
        };

        reset({});

        modal && fetchData();
        modal && setDisabled(type === "show" ? true : false);
    }, [modal]);

    return (
        <ModalChakra
            isOpen={modal}
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
                                    <p>
                                        ¿Esta seguro que desea eliminar este
                                        registro?
                                    </p>
                                ) : (
                                    <div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <InputText
                                                    label="Nombre"
                                                    name="name"
                                                    control={control}
                                                    errors={errors}
                                                    rules={{
                                                        required:
                                                            "Este campo es requerido",
                                                    }}
                                                    disabled={disabled}
                                                />
                                            </div>

                                            <div>
                                                <InputText
                                                    label="Dirección"
                                                    name="address"
                                                    control={control}
                                                    errors={errors}
                                                    rules={{
                                                        required:
                                                            "Este campo es requerido",
                                                    }}
                                                    disabled={disabled}
                                                />
                                            </div>

                                            <div>
                                                <InputText
                                                    label="Ciudad"
                                                    name="city"
                                                    control={control}
                                                    errors={errors}
                                                    rules={{
                                                        required:
                                                            "Este campo es requerido",
                                                    }}
                                                    disabled={disabled}
                                                />
                                            </div>

                                            <div>
                                                <InputText
                                                    label="Email de Administrador"
                                                    name="admin_email"
                                                    control={control}
                                                    errors={errors}
                                                    disabled={disabled}
                                                />
                                            </div>

                                            <div>
                                                <InputSelectAsync
                                                    label="Empresa"
                                                    name="company_id"
                                                    control={control}
                                                    errors={errors}
                                                    disabled={disabled}
                                                    route={route(
                                                        "company.select",
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <InputSelectAsync
                                                    label="Administrador del Conjunto"
                                                    name="user_id"
                                                    control={control}
                                                    errors={errors}
                                                    disabled={disabled}
                                                    route={route(
                                                        "users.select_user",
                                                    )}
                                                />
                                            </div>

                                            <InputCheckBox
                                                label="Cámaras"
                                                name="is_cameras"
                                                control={control}
                                                errors={errors}
                                                message="(Si el conjunto tiene cámaras)"
                                                disabled={disabled}
                                            />

                                            <InputCheckBox
                                                label="WhatsApp"
                                                name="is_whatsapp"
                                                control={control}
                                                errors={errors}
                                                message="(Si el conjunto cuenta con notificaciones por WhatsApp)"
                                                disabled={disabled}
                                            />

                                            <InputCheckBox
                                                label="Automatización"
                                                name="is_outomatisering"
                                                control={control}
                                                errors={errors}
                                                message="(Si el conjunto valida, placas y cédulas  automaticamente.)"
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
