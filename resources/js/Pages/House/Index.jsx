import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";
import DataTables, { TableButtons } from "@/Components/DataTables";
import React from "react";
import { useForm, Controller } from "react-hook-form";

import {
    InputText,
    InputSelect,
    InputSelectSimple,
} from "@/Components/InputsForm";

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
import { usePage } from "@inertiajs/react";
const initialState = { reload: false };

const { useGlobalState } = createGlobalState(initialState);
import { FaCirclePlus, FaFileImport } from "react-icons/fa6";

import {
    Modal as ModalChakra,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
} from "@chakra-ui/react";

import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

import InputLabel from "@/Components/InputLabel.jsx";

import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

registerPlugin(FilePondPluginFileValidateType);

export default function Index({ roles, auth }) {
    const [reload, setReload] = useGlobalState("reload");

    const [open, setOpen] = React.useState(false);
    const [type, setType] = React.useState("create");
    const [id, setId] = React.useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        isOpen: isOpenModal,
        onOpen: onOpenModal,
        onClose: onCloseModal,
    } = useDisclosure();

    const [isLoad, setIsLoad] = React.useState(false);

    const columns = [
        {
            name: "Propietario",
            selector: (row) => row.owner_name + " " + row.owner_surname,
            sortable: true,
        },

        {
            name: "N. Casa",
            selector: (row) => row.number_house,
            sortable: true,
        },
        {
            name: "Conjunto",
            selector: (row) => row.complex.name,
            sortable: true,
        },
        {
            name: "Teléfonos",
            selector: (row) =>
                row.owner_phone + " - " + (row.owner_phone_2 || "N/A"),
            sortable: true,
        },
        {
            name: "Email",
            selector: (row) => row.owner_email,
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

    const { complexes } = usePage().props;

    const {
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        control,
    } = useForm();

    const importFile = (data) => {
        console.log(data.file_import);
        /*
        setIsLoad(true);
        const formData = new FormData();
        formData.append("complex_id", data.complex_id);
        formData.append("file_import", data.file_import[0]);


        fetch(route("house.import"), {
            method: "POST",
            headers: {
                Accept: "Multipart/form-data",
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data.status) {
                    Object.keys(data.errors).forEach((key) => {
                        setError(key, {
                            type: "manual",
                            message: data.errors[key][0],
                        });
                    });

                    toast.error(data.message);
                } else {
                    setReload(true);
                    onCloseModal();
                    reset();

                    toast.success(data.message);
                }
            })
            .finally(() => setIsLoad(false));
            */
    };

    return (
        <DashboardLayout user={auth.user} roles={roles} title={"Casas"}>
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Casas",
                        link: route("house.index"),
                    },
                ]}
                type={"button"}
                onClick={() => {
                    setType("create");
                    setId(null);
                    onOpen();
                }}
                customButton={
                    <button
                        type="button"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded shadow-sm focus:outline-none uppercase hover:bg-opacity-80 transition-all duration-200"
                        onClick={onOpenModal}
                    >
                        <FaFileImport size={18} className="mr-2" />
                        Importar Casas
                    </button>
                }
            />

            <div className="mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="mx-4 my-4">
                        <DataTables
                            url={route("house.list")}
                            columns={columns}
                            reload={reload}
                            filter
                        />
                    </div>
                </div>
            </div>

            <ActionModal type={type} modal={isOpen} onClose={onClose} id={id} />

            <ImportHouses isOpen={isOpenModal} onClose={onCloseModal} />

            <ToastContainer />
        </DashboardLayout>
    );
}

function ActionModal({ type, modal, onClose, id }) {
    const { complexes } = usePage().props;

    const {
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        control,
    } = useForm({
        defaultValues: {
            complex_id: "",
            number_house: "",
            owner_name: "",
            owner_surname: "",
            owner_email: "",
            owner_phone: "",
            owner_phone_2: "",
        },
    });

    const [, setReload] = useGlobalState("reload");
    const [isLoading, setIsLoading] = React.useState(false);
    const [disabled, setDisabled] = React.useState(false);

    const onSubmit = async (data) => {
        switch (type) {
            case "create":
                setReload(false);
                setIsLoading(true);

                await CreateAction(route("house.create"), data)
                    .then((response) => {
                        if (!response.status) {
                            Object.keys(response.errors).forEach((key) => {
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

                break;

            case "edit":
                setReload(false);
                setIsLoading(true);

                await UpdateAction(route("house.update", id), data)
                    .then((response) => {
                        if (!response.status) {
                            Object.keys(response.errors).forEach((key) => {
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

                break;

            case "destroy":
                setReload(false);
                setIsLoading(true);

                await DeleteAction(route("house.destroy", id))
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

                break;
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            if (type === "edit" || type === "show" || type === "destroy") {
                await EditAction(route("house.show", id)).then((response) => {
                    if (response.status) {
                        reset({
                            complex_id: response.data.complex_id,
                            number_house: response.data.number_house,
                            owner_name: response.data.owner_name,
                            owner_surname: response.data.owner_surname,
                            owner_email: response.data.owner_email,
                            owner_phone: response.data.owner_phone,
                            owner_phone_2: response.data.owner_phone_2,
                        });
                    }
                });
            }

            type === "create" && reset();
        };

        reset({});

        modal && fetchData();
        modal && setDisabled(type == "show" ? true : false);
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
                <ModalHeader>
                    <TitleModal onClose={onClose} type={type} />
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {type === "destroy" ? (
                            <p>
                                ¿Esta seguro que desea eliminar este registro?
                            </p>
                        ) : (
                            <div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-4">
                                    <InputSelect
                                        label="Conjunto"
                                        name="complex_id"
                                        control={control}
                                        options={
                                            complexes.map((complex) => ({
                                                value: complex.id,
                                                label: complex.name,
                                            })) || []
                                        }
                                        errors={errors}
                                        rules={{
                                            required: "Este campo es requerido",
                                        }}
                                        disabled={disabled}
                                    />

                                    <InputText
                                        label="N. de Casa"
                                        name="number_house"
                                        control={control}
                                        errors={errors}
                                        rules={{
                                            required: "Este campo es requerido",
                                        }}
                                        disabled={disabled}
                                    />

                                    <InputText
                                        label="Nombres"
                                        name="owner_name"
                                        control={control}
                                        errors={errors}
                                        rules={{
                                            required: "Este campo es requerido",
                                            pattern: {
                                                value: /^[a-zA-Z\s]*$/,
                                                message:
                                                    "Solo se permiten letras y espacios",
                                            },
                                        }}
                                        disabled={disabled}
                                    />

                                    <InputText
                                        label="Apellidos"
                                        name="owner_surname"
                                        control={control}
                                        errors={errors}
                                        rules={{
                                            required: "Este campo es requerido",
                                            pattern: {
                                                value: /^[a-zA-Z\s]*$/,
                                                message:
                                                    "Solo se permiten letras y espacios",
                                            },
                                        }}
                                        disabled={disabled}
                                    />

                                    <InputText
                                        label="Email"
                                        name="owner_email"
                                        type="email"
                                        control={control}
                                        errors={errors}
                                        rules={{
                                            required: "Este campo es requerido",
                                            pattern: {
                                                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/,
                                                message: "Email invalido",
                                            },
                                        }}
                                        disabled={disabled}
                                    />

                                    <InputText
                                        label="Teléfono  1"
                                        name="owner_phone"
                                        control={control}
                                        errors={errors}
                                        type={"number"}
                                        rules={{
                                            required: "Este campo es requerido",
                                            maxLength: {
                                                value: 10,
                                                message: "Maximo 10 caracteres",
                                            },
                                            minLength: {
                                                value: 9,
                                                message: "Minimo 9 caracteres",
                                            },
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message:
                                                    "Solo se permiten numeros",
                                            },
                                        }}
                                        disabled={disabled}
                                    />

                                    <InputText
                                        label="Teléfono 2"
                                        name="owner_phone_2"
                                        control={control}
                                        errors={errors}
                                        type={"number"}
                                        rules={{
                                            maxLength: {
                                                value: 10,
                                                message: "Maximo 10 caracteres",
                                            },
                                            minLength: {
                                                value: 6,
                                                message: "Minimo 6 caracteres",
                                            },
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message:
                                                    "Solo se permiten numeros",
                                            },
                                        }}
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
            </ModalContent>
        </ModalChakra>
    );
}

function ImportHouses({ isOpen, onClose }) {
    const [disabledButton, setDisabledButton] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const [files, setFiles] = React.useState([]);
    const [complexId, setComplexId] = React.useState(null);

    const [reload, setReload] = useGlobalState("reload");

    const importFile = () => {
        if (files.length === 0) {
            toast.error("Seleccione un archivo");
            return;
        }

        if (!complexId) {
            toast.error("Seleccione un conjunto");
            return;
        }

        setLoading(true);

        const formData = new FormData();

        formData.append("file", files[0].file);
        formData.append("complex_id", complexId);

        axios
            .post(route("house.import"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                if (response.data.status) {
                    setFiles([]);
                    toast.success(response.data.message);
                    onClose();
                    setReload(!reload);
                } else {
                    toast.error(response.data.message);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    React.useEffect(() => {
        if (files.length > 0) {
            setDisabledButton(false);
        } else {
            setDisabledButton(true);
        }
    }, [files]);

    React.useEffect(() => {
        if (isOpen) {
            setFiles([]);
        }
    }, [isOpen]);

    const { complexes } = usePage().props;

    return (
        <ModalChakra
            isOpen={isOpen}
            onClose={onClose}
            closeOnOverlayClick={false}
            closeOnEsc={false}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Importar Usuarios</ModalHeader>
                <ModalCloseButton className="p-2" />

                <ModalBody>
                    <div className={"space-y-2"}>
                        <InputLabel value={"Seleccionar Conjunto"} />

                        <InputSelectSimple
                            options={
                                complexes.map((complex) => ({
                                    value: complex.id,
                                    label: complex.name,
                                })) || []
                            }
                            label="Conjunto"
                            name="complex_id"
                            onChange={(e) => {
                                setComplexId(e);
                            }}
                            value={complexId}
                            disabled={loading}
                        />

                        <InputLabel value={"Seleccionar Archivo"} />

                        <FilePond
                            allowFileEncode={true}
                            allowImagePreview={true}
                            allowFileTypeValidation={true}
                            files={files}
                            onupdatefiles={setFiles}
                            allowMultiple={false}
                            maxFiles={1}
                            disabled={loading}
                            name="file"
                            acceptedFileTypes={[
                                "application/vnd.ms-excel",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            ]}
                            labelIdle='Arrastra y suelta tus archivos o <span class="filepond--label-action">Buscar en el equipo</span>'
                        />
                    </div>
                </ModalBody>

                <ModalFooter>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded shadow-sm focus:outline-none uppercase hover:bg-opacity-80 transition-all duration-200"
                        onClick={importFile}
                        disabled={loading}
                    >
                        Importar
                    </button>
                </ModalFooter>
            </ModalContent>
        </ModalChakra>
    );
}
