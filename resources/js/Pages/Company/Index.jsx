import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";
import DataTables, { TableButtons } from "@/Components/DataTables";
import React from "react";
import { useForm } from "react-hook-form";

import { InputText } from "@/Components/InputsForm";

import { TitleModal, ButtonModal, EditAction } from "@/Utils/Util";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { createGlobalState } from "react-hooks-global-state";

const initialState = { reload: false };

const { useGlobalState } = createGlobalState(initialState);

import { HashLoader } from "react-spinners";

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

    const { isOpen, onOpen, onClose } = useDisclosure();

    const columns = [
        {
            name: "Nombre",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Descripción",
            selector: (row) => row.description,
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
        <DashboardLayout user={auth.user} roles={roles} title={"Empresas"}>
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Empresas",
                        link: route("company.index"),
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
                            url={route("company.list")}
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
        getValues,
    } = useForm({
        defaultValues: {
            name: "",
            address: "",
            city: "",
            is_cameras: false,
            is_whatsapp: false,
            admin_email: "",
        },
    });

    const [, setReload] = useGlobalState("reload");
    const [isLoading, setIsLoading] = React.useState(false);
    const [disabled, setDisabled] = React.useState(false);
    const [fetching, setFetching] = React.useState(false);

    const onSubmit = (data, e) => {
        switch (type) {
            case "create":
                data.logo = e.target.logo.files[0];

                setReload(false);
                setIsLoading(true);

                const formData = new FormData();

                formData.append("name", data.name);
                formData.append("description", data.description);
                formData.append("logo", data.logo);

                axios
                    .post(
                        route("company.create"),
                        {
                            name: data.name,
                            description: data.description,
                            logo: data.logo,
                        },
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        },
                    )
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
                data.logo = e.target.logo.files[0];

                setReload(false);
                setIsLoading(true);

                const formDataEdit = new FormData();

                formDataEdit.append("name", data.name);
                formDataEdit.append("description", data.description);
                formDataEdit.append("logo", data.logo);

                axios
                    .post(route("company.update", id), data, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    })
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
                    .delete(route("company.destroy", id))
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
            if (type === "edit" || type === "show") {
                await EditAction(route("company.show", id))
                    .then((response) => {
                        reset({
                            name: response.data.name,
                            description: response.data.description,
                            logo: "",
                            logo_url: response.data.logo_url,
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
                                                    label="Descripción"
                                                    name="description"
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
                                                {(type === "show" ||
                                                    type === "edit") && (
                                                    <img
                                                        src={getValues(
                                                            "logo_url",
                                                        )}
                                                        className="w-32"
                                                    />
                                                )}

                                                {type === "create" ? (
                                                    <InputText
                                                        label="Logo"
                                                        name="logo"
                                                        type="file"
                                                        control={control}
                                                        errors={errors}
                                                        rules={{
                                                            required:
                                                                "Este campo es requerido",
                                                        }}
                                                        disabled={disabled}
                                                    />
                                                ) : (
                                                    <InputText
                                                        label="Logo"
                                                        name="logo"
                                                        type="file"
                                                        control={control}
                                                        errors={errors}
                                                        disabled={disabled}
                                                    />
                                                )}
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
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </ModalChakra>
    );
}
