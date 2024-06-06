import DashboardLayout from "@/Layouts/DashboardLayout";
import Breadcrumb from "@/Components/Breadcrumb";

import { useForm } from "react-hook-form";

import {
    InputText,
    InputSelectAsync,
    InputCKEditor,
    InputVisitType,
} from "@/Components/InputsForm";

import { useStore } from "@/Store/ComplexStore";
import React from "react";

import "react-toastify/dist/ReactToastify.css";

import { ShowAction } from "@/Utils/Util";
import PrimaryButton from "@/Components/PrimaryButton";
import { toast } from "react-toastify";

import { VehicleInfoModal, PersonInfoModal } from "@/Components/ModalData";

import { router } from "@inertiajs/react";

import { PiArrowFatLeftFill } from "react-icons/pi";
import { FiRefreshCcw } from "react-icons/fi";

import {
    CIInfo,
    VechicleInfo,
    HouseInfo,
    DataNotFound,
} from "@/Pages/Visit/Create";

import axios from "axios";

export default function Index({ roles, auth }) {
    const complex = useStore((state) => state.complex_id);

    const [key, setKey] = React.useState(0);

    const [modalVehicle, setModalVehicle] = React.useState(false);
    const [modalPerson, setModalPerson] = React.useState(false);

    const [vehicle, setVehicle] = React.useState(null);
    const [person, setPerson] = React.useState(null);
    const [house, setHouse] = React.useState(null);

    const [submit, setSubmit] = React.useState(false);

    const [personInfo, setPersonInfo] = React.useState(null);
    const [vehicleInfo, setVehicleInfo] = React.useState(null);

    const {
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        control,
        setValue,
        getValues,
        watch,
    } = useForm({
        defaultValues: {
            house_id: "",
            visit_date: "",
            visit_time: "",
            description: "",
            vehicle_plate: "",
            visitor_ci: "",
            number_visitors: "",
            type_visit: "",
        },
    });

    React.useEffect(() => {
        setKey((prevKey) => prevKey + 1);
    }, [complex]);

    const onSubmit = (data) => {
        setSubmit(true);

        axios
            .post(route("early_visit.create"), data)
            .then((response) => {
                if (!response.data.status) {
                    Object.keys(response.data.errors).forEach((key) => {
                        setError(key, {
                            type: "manual",
                            message: response.data.errors[key][0],
                        });
                    });

                    toast.error(response.data.message);
                } else {
                    toast.success(response.data.message);

                    reset();

                    setHouse(null);
                    setPerson(null);
                    setVehicle(null);

                    router.visit(route("early_visit.createView"));
                }
            })
            .finally(() => {
                setSubmit(false);
            });
    };

    return (
        <DashboardLayout
            user={auth.user}
            roles={roles}
            title="Crear - Visitas Anticipadas"
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
                    {
                        label: "Crear",
                        link: route("early_visit.createView"),
                    },
                ]}
                customData={<ButtonsTools />}
            />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white shadow-sm sm:rounded-lg">
                    <form onSubmit={handleSubmit(onSubmit)} id="form-create">
                        <div className="mx-4 my-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 px-4 pb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-1 grid-rows-1 sm:grid-rows-1 gap-4 pt-8">
                                    <div>
                                        <InputVisitType
                                            label="Tipo de Visita"
                                            name="type_visit"
                                            control={control}
                                            errors={errors}
                                            rules={{
                                                required:
                                                    "Este campo es requerido",
                                            }}
                                            watch={watch}
                                        />
                                        <div className="mt-2">
                                            <InputCKEditor
                                                label="Descripción"
                                                name="description"
                                                control={control}
                                                errors={errors}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
                                    <div>
                                        <div>
                                            <InputSelectAsync
                                                key={key}
                                                label="Casa"
                                                name="house_id"
                                                route={route("house.select")}
                                                control={control}
                                                errors={errors}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                }}
                                                setValue={setValue}
                                                id={complex}
                                                onAction={async (e) => {
                                                    await ShowAction(
                                                        route(
                                                            "house.show",
                                                            e.value
                                                        )
                                                    ).then((response) => {
                                                        if (response.status) {
                                                            setHouse(
                                                                response.data
                                                            );
                                                        } else {
                                                            setHouse(null);
                                                        }
                                                    });
                                                }}
                                            />

                                            {house && (
                                                <HouseInfo house={house} />
                                            )}
                                        </div>

                                        <div className="mt-2">
                                            <InputText
                                                label="Cédula del Visitante"
                                                name="visitor_ci"
                                                type="text"
                                                control={control}
                                                errors={errors}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                }}
                                                onChange={async (e) => {
                                                    if (
                                                        e.target.value.length ==
                                                        10
                                                    ) {
                                                        await ShowAction(
                                                            route(
                                                                "extern_data.person",
                                                                getValues(
                                                                    "visitor_ci"
                                                                )
                                                            )
                                                        ).then((response) => {
                                                            if (
                                                                response.status
                                                            ) {
                                                                setPerson(
                                                                    response.data
                                                                );

                                                                setPersonInfo(
                                                                    false
                                                                );
                                                            } else {
                                                                setPerson(null);

                                                                setPersonInfo(
                                                                    true
                                                                );
                                                            }
                                                        });
                                                    } else {
                                                        setPerson(null);

                                                        setPersonInfo(false);
                                                    }
                                                }}
                                            />
                                            {person && (
                                                <CIInfo
                                                    person={person}
                                                    value={getValues(
                                                        "visitor_ci"
                                                    )}
                                                />
                                            )}

                                            {personInfo && (
                                                <DataNotFound
                                                    label="N. Cedula"
                                                    input={getValues(
                                                        "visitor_ci"
                                                    )}
                                                />
                                            )}
                                        </div>

                                        <div className="mt-2">
                                            <InputText
                                                label="Placa del Vehículo"
                                                name="vehicle_plate"
                                                type="text"
                                                control={control}
                                                errors={errors}
                                                rules={{
                                                    required:
                                                        watch("type_visit") ==
                                                            "Delivery" ||
                                                        watch("type_visit") ==
                                                            "Taxi"
                                                            ? "Este campo es requerido"
                                                            : "",
                                                }}
                                                onChange={async (e) => {
                                                    if (
                                                        e.target.value.length ==
                                                            6 ||
                                                        e.target.value.length ==
                                                            7
                                                    ) {
                                                        await ShowAction(
                                                            route(
                                                                "extern_data.vehicle",
                                                                getValues(
                                                                    "vehicle_plate"
                                                                )
                                                            )
                                                        ).then((response) => {
                                                            if (
                                                                response.status
                                                            ) {
                                                                setVehicle(
                                                                    response.data
                                                                );

                                                                setVehicleInfo(
                                                                    false
                                                                );
                                                            } else {
                                                                setVehicle(
                                                                    null
                                                                );

                                                                setVehicleInfo(
                                                                    true
                                                                );
                                                            }
                                                        });
                                                    } else {
                                                        setVehicle(null);

                                                        setVehicleInfo(false);
                                                    }
                                                }}
                                            />

                                            {vehicle && (
                                                <VechicleInfo
                                                    vehicle={vehicle}
                                                />
                                            )}

                                            {vehicleInfo && (
                                                <DataNotFound
                                                    label="Placa"
                                                    input={getValues(
                                                        "vehicle_plate"
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <InputText
                                            label="Visitantes"
                                            name="number_visitors"
                                            type="number"
                                            control={control}
                                            errors={errors}
                                            rules={{
                                                required:
                                                    "Este campo es requerido",
                                            }}
                                        />
                                        <div className="mt-2 mb-2">
                                            <InputText
                                                label="Hora de Visita"
                                                name="visit_time"
                                                type="time"
                                                control={control}
                                                errors={errors}
                                                rules={{
                                                    required:
                                                        "Este campo es requerido",
                                                }}
                                            />
                                        </div>

                                        <InputText
                                            label="Fecha de Visita"
                                            name="visit_date"
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            type="date"
                                            control={control}
                                            errors={errors}
                                            rules={{
                                                required:
                                                    "Este campo es requerido",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <PrimaryButton
                                type="submit"
                                disabled={submit}
                                className="mb-6"
                            >
                                Crear
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>

            <VehicleInfoModal
                modal={modalVehicle}
                onClose={() => setModalVehicle(false)}
                title="Datos del Vehículo"
                vehicle={vehicle}
            />

            <PersonInfoModal
                modal={modalPerson}
                onClose={() => setModalPerson(false)}
                title="Datos de la Persona"
                person={person}
            />
        </DashboardLayout>
    );
}

function ButtonsTools() {
    const back = () => {
        router.visit(route("early_visit.index"));
    };

    const refresh = () => {
        router.visit(route("early_visit.createView"));
    };

    return (
        <div className="flex">
            <button
                onClick={back}
                className="inline-flex items-center justify-center px-1 py-1 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none"
            >
                <PiArrowFatLeftFill size={20} />
            </button>
            <button
                onClick={refresh}
                className="inline-flex items-center justify-center px-1 py-1 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md shadow-sm hover:bg-amber-700 focus:outline-none ml-2"
            >
                <FiRefreshCcw size={20} />
            </button>
        </div>
    );
}
