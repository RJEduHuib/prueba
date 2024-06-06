import DashboardLayout from "@/Layouts/DashboardLayout";
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
            name: "Puerto",
            selector: (row) => row.port,
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
                        setOpen(true);
                    }}
                    onDelete={() => {
                        setType("destroy");
                        setId(row.id);
                        setOpen(true);
                    }}
                    onShow={() => {
                        setType("show");
                        setId(row.id);
                        setOpen(true);
                    }}
                />
            ),
        },
    ];

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
                    setOpen(true);
                }}
            />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                modal={open}
                onClose={() => setOpen(false)}
                id={id}
            />

            <ToastContainer />
        </DashboardLayout>
    );
}

function ActionModal({ type, modal, onClose, id = 0 }) {
    const {
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        control,
    } = useForm({
        defaultValues: {
            complex_id: "",
            port: "",
            direction_ip: "",
            user: "",
            password: "",
            is_active: "",
        },
    });

    const [, setReload] = useGlobalState("reload");
    const [isLoading, setIsLoading] = React.useState(false);
    const [disabled, setDisabled] = React.useState(false);

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
            if (type === "edit" || type === "show" || type === "destroy") {
                await EditAction(route("setting.show", id)).then((response) => {
                    if (response.status) {
                        reset({
                            complex_id: response.data.complex_id,
                            port: response.data.port,
                            direction_ip: response.data.direction_ip,
                            user: response.data.user,
                            password: response.data.password,
                            is_active: response.data.is_active,
                        });
                    }
                });
            }

            type === "create" && reset();
        };

        reset({});

        modal && fetchData();
        modal && setDisabled(type === "show" ? true : false);
    }, [modal]);

    return (
        <Modal show={modal} onClose={onClose} maxWidth="1xl">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <TitleModal onClose={onClose} type={type} />

                {type === "destroy" ? (
                    <p className="mt-2">
                        ¿Esta seguro que desea eliminar este registro?
                    </p>
                ) : (
                    <div className="mt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-4">
                            <InputText
                                label="Dirección de Enlace"
                                name="direction_ip"
                                control={control}
                                errors={errors}
                                rules={{
                                    required: "Este campo es requerido",
                                    pattern: {
                                        value: /^([0-9]{1,3}\.){3}[0-9]{1,3}$/,
                                        message: "Formato de IP incorrecto",
                                    },
                                }}
                                disabled={disabled}
                            />

                            <InputText
                                label="Puerto"
                                name="port"
                                control={control}
                                errors={errors}
                                rules={{
                                    required: "Este campo es requerido",
                                    pattern: {
                                        value: /^[0-9]{1,5}$/,
                                        message: "Formato de puerto incorrecto",
                                    },
                                }}
                                disabled={disabled}
                            />

                            <InputText
                                label="Usuario"
                                name="user"
                                control={control}
                                errors={errors}
                                rules={{
                                    required: "Este campo es requerido",
                                }}
                                disabled={disabled}
                            />

                            <InputText
                                label="Contraseña"
                                type="password"
                                name="password"
                                control={control}
                                errors={errors}
                                rules={{
                                    required: "Este campo es requerido",
                                }}
                                disabled={disabled}
                            />

                            <InputSelect
                                label="Estado"
                                name="is_active"
                                control={control}
                                errors={errors}
                                rules={{
                                    required: "Este campo es requerido",
                                }}
                                options={[
                                    { value: 1, label: "Activo" },
                                    { value: 0, label: "Inactivo" },
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
                                    required: "Este campo es requerido",
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
        </Modal>
    );
}
