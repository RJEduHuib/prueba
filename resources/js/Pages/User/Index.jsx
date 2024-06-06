import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";
import DataTables, { TableButtons } from "@/Components/DataTables";
import Modal from "@/Components/Modal";
import React from "react";
import { useForm } from "react-hook-form";

import { InputText, InputSelect } from "@/Components/InputsForm";

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

export default function User({ auth, roles }) {
    const [reload, setReload] = useGlobalState("reload");

    const [open, setOpen] = React.useState(false);
    const [type, setType] = React.useState("create");
    const [id, setId] = React.useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const columns = [
        {
            name: "Roles",
            selector: (row) => (
                <span>
                    {row.roles_names.map((role, index) => (
                        <span
                            key={index}
                            className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-1 mr-1"
                        >
                            {role}
                        </span>
                    ))}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Nombre",
            selector: (row) => row.name + " " + row.surname,
            sortable: true,
        },
        {
            name: "Cédula",
            selector: (row) => row.ci,
            sortable: true,
        },
        {
            name: "Teléfono ",
            selector: (row) => row.phone,
            sortable: true,
        },
        {
            name: "Email",
            selector: (row) => row.email,
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
        <DashboardLayout user={auth.user} roles={roles} title="Usuarios">
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Usuarios",
                        link: route("user.index"),
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
                            url={route("user.list")}
                            columns={columns}
                            reload={reload}
                            filter
                        />
                    </div>
                </div>
            </div>

            <ActionModal modal={isOpen} onClose={onClose} type={type} id={id} />

            <ToastContainer />
        </DashboardLayout>
    );
}

function ActionModal({ modal, onClose, type, id }) {
    const {
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        control,
    } = useForm({
        defaultValues: {
            name: "",
            surname: "",
            ci: "",
            phone: "",
            address: "",
            city: "",
            email: "",
            roles: [],
            password: "",
            password_confirmation: "",
        },
    });

    const [, setReload] = useGlobalState("reload");

    const [isLoading, setIsLoading] = React.useState(false);

    const [showPassword, setShowPassword] = React.useState(false);
    const [disabled, setDisabled] = React.useState(false);
    const [fetching, setFetching] = React.useState(false);

    const onSubmit = async (data) => {
        let response;

        switch (type) {
            case "create":
                setReload(false);
                setIsLoading(true);
                response = await CreateAction(route("user.create"), data);

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

                setIsLoading(false);
                break;
            case "edit":
                setReload(false);
                setIsLoading(true);

                await UpdateAction(route("user.update", id), data)
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

                await DeleteAction(route("user.destroy", id))
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
            switch (type) {
                case "edit":
                    await EditAction(route("user.show", id)).then(
                        (response) => {
                            const rolesNames = response.data.roles.map(
                                (role) => {
                                    return role.name;
                                },
                            );

                            if (response.status) {
                                reset({
                                    name: response.data.name,
                                    surname: response.data.surname,
                                    ci: response.data.ci,
                                    phone: response.data.phone,
                                    address: response.data.address,
                                    city: response.data.city,
                                    email: response.data.email,
                                    roles: rolesNames,
                                });
                            }
                        },
                    );
                    break;

                case "show":
                    await EditAction(route("user.show", id)).then(
                        (response) => {
                            const rolesNames = response.data.roles.map(
                                (role) => {
                                    return role.name;
                                },
                            );

                            if (response.status) {
                                reset({
                                    name: response.data.name,
                                    surname: response.data.surname,
                                    ci: response.data.ci,
                                    phone: response.data.phone,
                                    address: response.data.address,
                                    city: response.data.city,
                                    email: response.data.email,
                                    roles: rolesNames,
                                });
                            }
                        },
                    );
                    break;

                case "create":
                    reset({});
                    break;
            }
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
                <ModalHeader>
                    <TitleModal onClose={onClose} type={type} />
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody className="pb-4">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {type === "destroy" ? (
                            <>
                                <p>
                                    ¿Esta seguro que desea eliminar este
                                    registro?
                                </p>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-4 h-fit">
                                        <div>
                                            <InputText
                                                label="Nombre"
                                                errors={errors}
                                                name="name"
                                                control={control}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                }}
                                                disabled={disabled}
                                            />
                                        </div>
                                        <div>
                                            <InputText
                                                label="Apellido"
                                                errors={errors}
                                                name="surname"
                                                control={control}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                }}
                                                disabled={disabled}
                                            />
                                        </div>
                                        <div>
                                            <InputText
                                                label="Cédula"
                                                errors={errors}
                                                name="ci"
                                                control={control}
                                                type="number"
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                    maxLength: {
                                                        value: 10,
                                                        message:
                                                            "No puede tener mas de 10 caracteres",
                                                    },
                                                    minLength: {
                                                        value: 10,
                                                        message:
                                                            "No puede tener menos de 10 caracteres",
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
                                        <div>
                                            <InputText
                                                label="Teléfono"
                                                errors={errors}
                                                name="phone"
                                                control={control}
                                                type="number"
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                    maxLength: {
                                                        value: 10,
                                                        message:
                                                            "No puede tener mas de 10 caracteres",
                                                    },
                                                    minLength: {
                                                        value: 10,
                                                        message:
                                                            "No puede tener menos de 10 caracteres",
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

                                        <div>
                                            <InputText
                                                label="Dirección"
                                                errors={errors}
                                                name="address"
                                                control={control}
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
                                                errors={errors}
                                                name="city"
                                                control={control}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                }}
                                                disabled={disabled}
                                            />
                                        </div>

                                        <div>
                                            <InputText
                                                label="Email"
                                                errors={errors}
                                                name="email"
                                                control={control}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                }}
                                                disabled={disabled}
                                            />
                                        </div>

                                        <div>
                                            <InputSelect
                                                label="Roles"
                                                errors={errors}
                                                name="roles"
                                                control={control}
                                                disabled={disabled}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                }}
                                                multiple
                                                options={[
                                                    {
                                                        value: "Administrador",
                                                        label: "Administrador",
                                                    },
                                                    {
                                                        value: "Guardia",
                                                        label: "Guardia",
                                                    },
                                                    {
                                                        value: "Centralista",
                                                        label: "Centralista",
                                                    },
                                                    {
                                                        value: "Supervisor",
                                                        label: "Supervisor",
                                                    },
                                                    {
                                                        value: "SuperAdministrador",
                                                        label: "SuperAdministrador",
                                                    },
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            {type === "create" ||
                                            type === "edit" ? (
                                                <InputText
                                                    disabled={disabled}
                                                    label="Contraseña"
                                                    errors={errors}
                                                    name="password"
                                                    control={control}
                                                    type={"password"}
                                                    rules={
                                                        type === "create" && {
                                                            required:
                                                                "Este campo es requerido",
                                                            minLength: {
                                                                value: 8,
                                                                message:
                                                                    "No puede tener menos de 8 caracteres",
                                                            },
                                                        }
                                                    }
                                                />
                                            ) : null}
                                        </div>

                                        {type === "create" && (
                                            <div>
                                                <InputText
                                                    disabled={disabled}
                                                    label="Confirmar Contraseña"
                                                    errors={errors}
                                                    name="password_confirmation"
                                                    control={control}
                                                    type={"password"}
                                                    rules={
                                                        type === "create" && {
                                                            required:
                                                                "Este campo es requerido",
                                                            minLength: {
                                                                value: 8,
                                                                message:
                                                                    "No puede tener menos de 8 caracteres",
                                                            },
                                                        }
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
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
