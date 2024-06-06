import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import { createWorker } from "tesseract.js";

import React, { useEffect } from "react";
import axios from "axios";

import { useForm } from "react-hook-form";
import {
    InputText,
    InputSelectAsync,
    InputCKEditor,
    InputVisitType,
} from "@/Components/InputsForm";
import {
    RiRestartLine,
    RiCameraLine,
    RiSignalWifiErrorLine,
    RiWhatsappLine,
} from "react-icons/ri";

import { PiArrowFatLeftFill } from "react-icons/pi";
import { FiRefreshCcw } from "react-icons/fi";

import { ShowAction } from "@/Utils/Util";
import { toast } from "react-toastify";

import { PhotoProvider, PhotoView } from "react-photo-view";
import { BounceLoader } from "react-spinners";

import { router, usePage } from "@inertiajs/react";

import "react-photo-view/dist/react-photo-view.css";
import "react-toastify/dist/ReactToastify.css";

export default function Index({ roles, auth }) {
    const [vehicle, setVehicle] = React.useState(null);
    const [person, setPerson] = React.useState(null);
    const [house, setHouse] = React.useState(null);

    const [vehicleInfo, setVehicleInfo] = React.useState(false);
    const [personInfo, setPersonInfo] = React.useState(false);

    const [submit, setSubmit] = React.useState(false);

    const [fetchingCameras, setFetchingCameras] = React.useState(false);

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
            visitor_ci: "",
            number_visitors: "",
            type_visit: "",
            house_id: "",
            vehicle: vehicle,
            person: person,
        },
    });

    const [imagesUrls, setImagesUrls] = React.useState([]);
    const [images, setImages] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setErrorImages] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [loadingPlate, setLoadingPlate] = React.useState(false);
    const [loadingCi, setLoadingCi] = React.useState(false);

    const page = usePage();

    const fetchCameras = (ip, cam) => {
        setValue("vehicle_plate", "");
        setValue("visitor_ci", "");

        setFetchingCameras(true);
        setLoading(true);
        setErrorImages(false);
        setImagesUrls([]);
        setImages([]);

        const now = new Date();
        const options = {
            timeZone: "America/Guayaquil",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        };
        const date = now
            .toLocaleDateString("es-ES", options)
            .split("/")
            .reverse()
            .join("-");

        const url = `https://cameras.sjbdevsoftcloud.com/api/cameras/${ip}/${date}/${cam}`;

        axios
            .get(url)
            .then((response) => {
                if (response.data.status) {
                    response.data.images.forEach((url) => {
                        fetch(url)
                            .then((response) => response.blob())
                            .then((blob) => {
                                setImages((prev) => [...prev, blob]);
                            });
                        setImagesUrls((prev) => [...prev, url]);
                    });

                    setLoading(false);

                    if (page.props.complex.is_outomatisering) {
                        const platePath = response.data.images[0];
                        const dniPath = response.data.images[1];
                        fetchPlateNumber(platePath);
                        fetchDniNumber(dniPath).then(() => {});
                    }
                }
            })
            .catch((error) => {
                setErrorImages(true);
            })
            .finally(() => {
                setFetchingCameras(false);
            });
    };

    const fetchPlateNumber = (path) => {
        const parts = path.split("/");
        const pathFile = parts[5] + "/" + parts[6] + "/" + parts[7];

        axios
            .get("https://cameras.sjbdevsoftcloud.com/api/plate/" + pathFile)
            .then((response) => {
                if (response.data.status) {
                    setValue("vehicle_plate", response.data.plate);
                    getPlateInfo(response.data.plate);
                }
            });
    };

    const fetchDniNumber = async (path) => {
        const worker = await createWorker("eng");

        const ret = await worker.recognize(path);
        await worker.terminate();

        console.log(ret.data.text);

        const regex = /\b(?:\d{10}|NUL\d{10}|(?:\d{9}-\d))\b/g;
        const matches = ret.data.text.match(regex);

        if (matches && matches.length > 0) {
            const cleanedMatches = matches.map((match) =>
                match.replace(/\D/g, ""),
            );

            setValue("visitor_ci", cleanedMatches);
            getPersonInfo(cleanedMatches);
        }
    };

    const onSubmit = (data) => {
        setSubmit(true);

        const form = new FormData();

        images.forEach((image) => {
            form.append("visit_images[]", image);
        });

        form.append("visit_date", GetCurrentDate());
        form.append("visit_time", GetCurrentTime());
        form.append("description", data.description);
        form.append("vehicle_plate", data.vehicle_plate);
        form.append("visitor_ci", data.visitor_ci);
        form.append("number_visitors", data.number_visitors);
        form.append("type_visit", data.type_visit);
        form.append("house_id", data.house_id);
        form.append("vehicle", JSON.stringify(vehicle));
        form.append("person", JSON.stringify(person));

        axios
            .post(route("visit.create"), form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                if (response.data.status) {
                    toast.success(response.data.message);

                    reset({});
                    setValue("type_visit", "");
                    setValue("visitor_ci", "");
                    setVehicle(null);
                    setPerson(null);
                    setHouse(null);
                    clearErrors();

                    router.visit(route("visit.createView"));
                } else {
                    Object.keys(response.data.errors).forEach((key) => {
                        setError(key, {
                            type: "manual",
                            message: response.data.errors[key][0],
                        });
                    });

                    toast.error(response.data.message);
                }
            })
            .catch((error) => {
                if (error.response) {
                    const errors = error.response.data.errors;

                    Object.keys(errors).forEach((key) => {
                        setError(key, {
                            type: "manual",
                            message: errors[key][0],
                        });
                    });
                }
            })
            .finally(() => {
                setSubmit(false);
            });
    };

    const getPlateInfo = (plateVehicle) => {
        setLoadingPlate(true);

        axios
            .get(route("extern_data.vehicle", plateVehicle))
            .then((response) => {
                if (response.data.status) {
                    setVehicle(response.data.data);
                    setVehicleInfo(false);
                } else {
                    setVehicle(null);
                    setVehicleInfo(true);
                }
            })
            .finally(() => {
                setLoadingPlate(false);
            });
    };

    const getPersonInfo = (ci) => {
        setLoadingCi(true);

        if (ci[0] === "V" || ci[0] === "E") {
            axios
                .get(route("cedula_ve", ci))
                .then((response) => {
                    if (response.data.status) {
                        setPerson(response.data.data);
                        setPersonInfo(false);
                    } else {
                        setPerson(null);
                        setPersonInfo(true);
                    }
                })
                .finally(() => {
                    setLoadingCi(false);
                });
        } else {
            axios
                .get(route("extern_data.person", ci))
                .then((response) => {
                    if (response.data.status) {
                        setPerson(response.data.data);
                        setPersonInfo(false);
                    } else {
                        setPerson(null);
                        setPersonInfo(true);
                    }
                })
                .finally(() => {
                    setLoadingCi(false);
                });
        }
    };

    useEffect(() => {
        if (page.props.complex.is_cameras) {
            fetchCameras(
                page.props.settings.direction_ip,
                page.props.settings.cameras_number,
            );
        }
    }, []);

    return (
        <DashboardLayout
            user={auth.user}
            roles={roles}
            title="Crear - Bitácoras"
        >
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
                    {
                        label: "Crear Bitácora",
                        link: route("visit.createView"),
                    },
                ]}
                customData={<ButtonsTools />}
            />

            <div className=" mx-auto overflow-hidden sm:px-6 lg:px-8">
                <div className="bg-white shadow-sm sm:rounded-lg">
                    <form onSubmit={handleSubmit(onSubmit)} id="form-create">
                        <div className="mx-4 my-4">
                            {page.props.complex.is_cameras ? (
                                <>
                                    <SecondaryButton
                                        type="button"
                                        onClick={() => {
                                            fetchCameras(
                                                page.props.settings
                                                    .direction_ip,
                                                page.props.settings
                                                    .cameras_number,
                                            );
                                        }}
                                        className="pag-4 mt-6 px-4"
                                        disabled={fetchingCameras}
                                    >
                                        <RiRestartLine />
                                        <span className="ml-2">
                                            Cargar Datos
                                        </span>
                                    </SecondaryButton>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 px-4 pb-4">
                                        <PhotoProvider>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-1 sm:grid-rows-2 gap-4 h-fit">
                                                {imagesUrls &&
                                                    !loading &&
                                                    !error &&
                                                    imagesUrls.map(
                                                        (url, index) => (
                                                            <ImagePreview
                                                                url={url}
                                                                index={
                                                                    index + 1
                                                                }
                                                                loading={
                                                                    loading
                                                                }
                                                                error={error}
                                                                key={index}
                                                            />
                                                        ),
                                                    )}

                                                {loading &&
                                                    !error &&
                                                    Array.from(
                                                        Array(4),
                                                        (_, index) => (
                                                            <ImagePreviewLoading
                                                                index={
                                                                    index + 1
                                                                }
                                                                key={index + 1}
                                                            />
                                                        ),
                                                    )}

                                                {imagesUrls.length === 0 &&
                                                    error &&
                                                    Array.from(
                                                        Array(4),
                                                        (_, index) => (
                                                            <ImagePreviewError
                                                                index={
                                                                    index + 1
                                                                }
                                                                key={index}
                                                                message={
                                                                    message
                                                                }
                                                            />
                                                        ),
                                                    )}
                                            </div>
                                        </PhotoProvider>
                                        <div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
                                                <div>
                                                    <InputSelectAsync
                                                        label="Casa"
                                                        name="house_id"
                                                        route={route(
                                                            "house.select",
                                                        )}
                                                        control={control}
                                                        errors={errors}
                                                        rules={{
                                                            required:
                                                                "Este campo es requerido",
                                                        }}
                                                        setValue={setValue}
                                                        id={
                                                            page.props.complex
                                                                .id
                                                        }
                                                        onAction={async (e) => {
                                                            await ShowAction(
                                                                route(
                                                                    "house.show",
                                                                    e.value,
                                                                ),
                                                            ).then(
                                                                (response) => {
                                                                    if (
                                                                        response.status
                                                                    ) {
                                                                        setHouse(
                                                                            response.data,
                                                                        );
                                                                    } else {
                                                                        setHouse(
                                                                            null,
                                                                        );
                                                                    }
                                                                },
                                                            );
                                                        }}
                                                    />

                                                    {house && (
                                                        <HouseInfo
                                                            house={house}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <InputText
                                                        label="Placa del Vehículo "
                                                        name="vehicle_plate"
                                                        type="text"
                                                        control={control}
                                                        errors={errors}
                                                        loading={loadingPlate}
                                                        rules={{
                                                            required:
                                                                watch(
                                                                    "type_visit",
                                                                ) ===
                                                                    "Delivery" ||
                                                                watch(
                                                                    "type_visit",
                                                                ) === "Taxi"
                                                                    ? "Este campo es requerido"
                                                                    : "",
                                                        }}
                                                        onChange={async (e) => {
                                                            if (
                                                                e.target.value
                                                                    .length ===
                                                                    6 ||
                                                                e.target.value
                                                                    .length ===
                                                                    7
                                                            ) {
                                                                getPlateInfo(
                                                                    e.target
                                                                        .value,
                                                                );
                                                            } else {
                                                                setVehicle(
                                                                    null,
                                                                );

                                                                setVehicleInfo(
                                                                    false,
                                                                );
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
                                                            label="Vehículo "
                                                            input={getValues(
                                                                "vehicle_plate",
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <InputText
                                                        label="Cédula del Visitante"
                                                        name="visitor_ci"
                                                        type="text"
                                                        control={control}
                                                        errors={errors}
                                                        loading={loadingCi}
                                                        rules={{
                                                            required:
                                                                "Este campo es requerido",
                                                        }}
                                                        onChange={async (e) => {
                                                            if (
                                                                e.target.value
                                                                    .length ===
                                                                    10 ||
                                                                e.target.value
                                                                    .length ===
                                                                    9
                                                            ) {
                                                                getPersonInfo(
                                                                    e.target
                                                                        .value,
                                                                );
                                                            } else {
                                                                setPerson(null);

                                                                setPersonInfo(
                                                                    false,
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    {person && (
                                                        <CIInfo
                                                            person={person}
                                                            value={getValues(
                                                                "visitor_ci",
                                                            )}
                                                        />
                                                    )}

                                                    {personInfo && (
                                                        <DataNotFound
                                                            label="Persona"
                                                            input={getValues(
                                                                "visitor_ci",
                                                            )}
                                                        />
                                                    )}
                                                </div>
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
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-1 mt-4">
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
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-1 mt-4">
                                                <InputCKEditor
                                                    label="Descripción"
                                                    name="description"
                                                    control={control}
                                                    errors={errors}
                                                />
                                            </div>
                                            <PrimaryButton
                                                type="submit"
                                                disabled={submit}
                                                className="mb-6 mt-4"
                                            >
                                                Crear
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 pt-6 px-4 pb-4">
                                    <div>
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                            <div>
                                                <InputSelectAsync
                                                    label="Casa"
                                                    name="house_id"
                                                    route={route(
                                                        "house.select",
                                                    )}
                                                    control={control}
                                                    errors={errors}
                                                    rules={{
                                                        required:
                                                            "Este campo es requerido",
                                                    }}
                                                    setValue={setValue}
                                                    id={page.props.complex.id}
                                                    onAction={async (e) => {
                                                        await ShowAction(
                                                            route(
                                                                "house.show",
                                                                e.value,
                                                            ),
                                                        ).then((response) => {
                                                            if (
                                                                response.status
                                                            ) {
                                                                setHouse(
                                                                    response.data,
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
                                            <div>
                                                <InputText
                                                    label="Placa del Vehículo"
                                                    name="vehicle_plate"
                                                    type="text"
                                                    control={control}
                                                    errors={errors}
                                                    loading={loadingPlate}
                                                    rules={{
                                                        required:
                                                            watch(
                                                                "type_visit",
                                                            ) === "Delivery" ||
                                                            watch(
                                                                "type_visit",
                                                            ) === "Taxi"
                                                                ? "Este campo es requerido"
                                                                : "",
                                                    }}
                                                    onChange={async (e) => {
                                                        if (
                                                            e.target.value
                                                                .length == 6 ||
                                                            e.target.value
                                                                .length == 7
                                                        ) {
                                                            getPlateInfo(
                                                                e.target.value,
                                                            );
                                                        } else {
                                                            setVehicle(null);

                                                            setVehicleInfo(
                                                                false,
                                                            );
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
                                                            "vehicle_plate",
                                                        )}
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <InputText
                                                    label="Cédula del Visitante"
                                                    name="visitor_ci"
                                                    type="text"
                                                    control={control}
                                                    errors={errors}
                                                    loading={loadingCi}
                                                    rules={{
                                                        required:
                                                            "Este campo es requerido",
                                                    }}
                                                    onChange={async (e) => {
                                                        if (
                                                            e.target.value
                                                                .length == 10
                                                        ) {
                                                            setLoadingCi(true);
                                                            await ShowAction(
                                                                route(
                                                                    "extern_data.person",
                                                                    getValues(
                                                                        "visitor_ci",
                                                                    ),
                                                                ),
                                                            )
                                                                .then(
                                                                    (
                                                                        response,
                                                                    ) => {
                                                                        if (
                                                                            response.status
                                                                        ) {
                                                                            setPerson(
                                                                                response.data,
                                                                            );

                                                                            setPersonInfo(
                                                                                false,
                                                                            );
                                                                        } else {
                                                                            setPerson(
                                                                                null,
                                                                            );

                                                                            setPersonInfo(
                                                                                true,
                                                                            );
                                                                        }
                                                                    },
                                                                )
                                                                .finally(() => {
                                                                    setLoadingCi(
                                                                        false,
                                                                    );
                                                                });
                                                        } else {
                                                            setPerson(null);

                                                            setPersonInfo(
                                                                false,
                                                            );
                                                        }
                                                    }}
                                                />
                                                {person && (
                                                    <CIInfo
                                                        person={person}
                                                        value={getValues(
                                                            "visitor_ci",
                                                        )}
                                                    />
                                                )}

                                                {personInfo && (
                                                    <DataNotFound
                                                        label="Persona"
                                                        input={getValues(
                                                            "visitor_ci",
                                                        )}
                                                    />
                                                )}
                                            </div>
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
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-1 mt-4">
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
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-1 mt-4">
                                            <InputCKEditor
                                                label="Descripción"
                                                name="description"
                                                control={control}
                                                errors={errors}
                                            />
                                        </div>
                                        <PrimaryButton
                                            type="submit"
                                            disabled={submit}
                                            className="mb-6 mt-4"
                                        >
                                            Crear
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

export function HouseInfo({ house }) {
    return (
        <div className="w-full overflow-x-auto border text-sm p-2 mt-1">
            <ItemTable label="Casa" value={house.number_house} />
            <ItemTable
                label="Propietario"
                value={house.owner_name + " " + house.owner_surname}
            />
            <ItemTable label="Email" value={house.owner_email} />
            <ItemTableIcon label="Teléfono" value={house.owner_phone} />
            {house.owner_phone_2 && (
                <ItemTableIcon label="Teléfono 2" value={house.owner_phone_2} />
            )}
        </div>
    );
}

export function VechicleInfo({ vehicle }) {
    return vehicle.plate ? (
        <div className="w-full overflow-x-auto border text-sm p-2 mt-1">
            <ItemTable label="Tipo" value={vehicle.class || vehicle.type} />
            <ItemTable label="Placa" value={vehicle.plate} />
            <ItemTable label="Modelo" value={vehicle.model} />
            <ItemTable label="Marca" value={vehicle.brand} />
            <ItemTable label="Servicio" value={vehicle.service} />
            <ItemTable
                label="Año del Modelo"
                value={vehicle.model_year || vehicle.year}
            />
            <ItemTable
                label="Fecha Matricula"
                value={
                    vehicle.date_enrollment_anual || vehicle.registration_date
                }
            />
        </div>
    ) : (
        <ViewLayout>
            <div className="justify-center flex flex-col items-center">
                <div className="flex justify-center text-xs uppercase mt-1">
                    <div className="text-red-500 uppercase text-center">
                        No se encontraron datos
                    </div>
                </div>
            </div>
        </ViewLayout>
    );
}

export function DataNotFound({ label, input }) {
    return (
        <ViewLayout>
            <div className="justify-center flex flex-col items-center">
                <div className="flex justify-center text-xs uppercase mt-1">
                    <div className="text-red-500 uppercase text-center">
                        No se encontraron datos
                    </div>
                </div>

                <div>
                    {label} - {input}
                </div>
            </div>
        </ViewLayout>
    );
}

export function ViewLayout({ children }) {
    return (
        <div className="w-full overflow-x-auto border text-sm p-2 mt-1">
            {children}
        </div>
    );
}

export function CIInfo({ person, value }) {
    return (
        <div className="w-full overflow-x-auto border text-sm p-2 mt-1">
            <ItemTable label="N. de Cédula" value={value} />
            <ItemTable
                label="Nombre"
                value={
                    person.name
                        ? person.name
                        : "" + " " + person.lastname
                          ? person.lastname
                          : ""
                }
            />
            <div>
                <span className="font-bold mr-1">Antecedentes Penales: </span>
                <span className="text-green-500">No tiene antecendentes</span>
            </div>
        </div>
    );
}

export function ItemTable({ label, value }) {
    return (
        <div>
            <span className="font-bold mr-1">{label}: </span>
            <span>{value}</span>
        </div>
    );
}
export function ItemTableIcon({ label, value }) {
    return (
        <div className="flex items-center">
            <span className="font-bold">{label}: </span>
            <a
                href={`https://api.whatsapp.com/send?phone=593${value}`}
                target="_blank"
                className="underline"
            >
                <span className="flex items-center">
                    <RiWhatsappLine
                        size={18}
                        className="mr-1 ml-1 text-green-700"
                    />
                    {value}
                </span>
            </a>
        </div>
    );
}

export function GetCurrentTime() {
    const currentTime = new Date();

    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    return `${hours}:${minutes}`;
}

export function GetCurrentDate() {
    const currentDate = new Date();

    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();

    return `${day}-${month}-${year}`;
}

function ImagePreviewError({ index, message }) {
    return (
        <div className="justify-center flex flex-col items-center">
            <div className="flex items-center justify-center">
                <RiSignalWifiErrorLine className="text-red-500" size={50} />
            </div>

            <div className="flex justify-center text-xs uppercase mt-1">
                <div className="text-red-500 uppercase text-center">
                    Cámara {index} - {message}
                </div>
            </div>
        </div>
    );
}

function ImagePreviewLoading({ index }) {
    return (
        <div className="justify-center flex flex-col items-center">
            <div className="flex items-center justify-center">
                <BounceLoader
                    color={"#fde68a"}
                    loading={true}
                    className="w-full block mb-4"
                />
            </div>

            <div className="flex justify-center text-xs uppercase mt-1">
                <div className="text-red-500 uppercase">Cámara {index}</div>
            </div>
        </div>
    );
}

function ImagePreview({ url, index }) {
    const [loaded, setLoaded] = React.useState(false);

    return (
        <div className="justify-center flex flex-col items-center">
            <PhotoView src={url} overlay={true}>
                <img
                    src={url}
                    alt="Preview Camera"
                    loading={"lazy"}
                    style={{
                        filter: loaded ? "none" : "blur(5px)",
                        transition: "filter 0.5s ease",
                    }}
                    onLoad={() => setLoaded(true)}
                />
            </PhotoView>

            <div className="flex justify-center text-xs uppercase mt-1">
                <div className="text-green-500 flex">
                    <div>
                        <RiCameraLine />
                    </div>
                    <div className="ml-2">Cámara {index}</div>
                </div>
            </div>
        </div>
    );
}

function ButtonsTools() {
    const back = () => {
        router.visit(route("visit.index"));
    };

    const refresh = () => {
        router.visit(route("visit.createView"));
    };

    return (
        <div className="flex">
            <button
                onClick={back}
                className="inline-flex items-center justify-center px-1 py-1 text-sm font-medium text-white bg-amber-600 border border-transparent rounded shadow-sm focus:outline-none"
            >
                <PiArrowFatLeftFill size={20} />
            </button>
            <button
                onClick={refresh}
                className="inline-flex items-center justify-center px-1 py-1 text-sm font-medium text-white bg-amber-600 border border-transparent rounded shadow-sm focus:outline-none ml-2"
            >
                <FiRefreshCcw size={20} />
            </button>
        </div>
    );
}
