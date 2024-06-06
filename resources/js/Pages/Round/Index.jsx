import DashboardLayout from "@/Layouts/Layout";
import Breadcrumb from "@/Components/Breadcrumb";
import DataTables, { TableButtons } from "@/Components/DataTables";
import Modal from "@/Components/Modal";
import React from "react";
import { useForm } from "react-hook-form";
import {
    InputText,
    InputSelectGoogle,
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

import { RiDownload2Line, RiEye2Line } from "react-icons/ri";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { createGlobalState } from "react-hooks-global-state";
const initialState = { reload: false };

const { useGlobalState } = createGlobalState(initialState);
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

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

    const { isOpen, onClose, onOpen } = useDisclosure();

    const columns = [
        {
            name: "Fecha QR",
            selector: (row) => row.qr_fecha,
            sortable: true,
        },
        {
            name: "Conjunto",
            selector: (row) => row.complex.name,
            sortable: true,
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
        <DashboardLayout user={auth.user} roles={roles} title={"Rondas"}>
            <Breadcrumb
                items={[
                    {
                        label: "Inicio",
                        link: route("dashboard"),
                    },
                    {
                        label: "Rondas",
                        link: route("round.index"),
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
                            url={route("round.list")}
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
    const [latitude, setLatitude] = React.useState("");

    const {
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        control,
        setValue,
    } = useForm({
        defaultValues: {
            latitude: "",
            longitude: "",
            complex_id: "",
        },
    });

    const [map, setMap] = React.useState(null);
    const [marker, setMarker] = React.useState(null);

    const [longitude, setLongitude] = React.useState("");
    const [, setReload] = useGlobalState("reload");
    const [isLoading, setIsLoading] = React.useState(false);
    const [coods, setCoods] = React.useState(null);
    const [disabled, setDisabled] = React.useState(false);

    const onSubmit = async (data) => {
        switch (type) {
            case "create":
                setReload(false);
                setIsLoading(true);

                axios
                    .post(route("round.create"), data)
                    .then((response) => {
                        if (!response.data.status) {
                            toast.error(
                                response.data.message
                                    ? response.data.message
                                    : "Ocurrio un error, intentelo nuevamente"
                            );
                        } else {
                            setReload(true);
                            onClose();

                            toast.success(response.data.message);
                        }
                    })
                    .finally(() => setIsLoading(false));

                break;

            case "edit":
                setReload(false);
                setIsLoading(true);

                await UpdateAction(route("round.update", id), data)
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

            case "destroy":
                setReload(false);
                setIsLoading(true);

                await DeleteAction(route("round.destroy", id))
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

    const apiKey = import.meta.env.GOOGLE_MAPS_API_KEY || "";

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: apiKey,
    });

    const onLoad = React.useCallback(
        function callback(map) {
            setMap(map);

            if (latitude && longitude && map) {
                const maker = new window.google.maps.Marker({
                    position: {
                        lat: latitude ? latitude : -34.397,
                        lng: longitude ? longitude : 150.644,
                    },
                    map,
                    draggable: true,
                });

                maker.addListener("dragend", () => {
                    const newLat = maker.getPosition().lat();
                    const newLng = maker.getPosition().lng();

                    setValue("latitude", newLat);
                    setValue("longitude", newLng);
                });

                setMarker(maker);
            }
        },
        [latitude, longitude]
    );

    const onSearch = (e) => {
        const geocoder = new google.maps.Geocoder();
        setCoods(e);
        geocoder.geocode({ placeId: e.value.place_id }, (results, status) => {
            if (status === "OK") {
                map.setCenter(results[0].geometry.location);

                setValue("latitude", results[0].geometry.location.lat());
                setValue("longitude", results[0].geometry.location.lng());

                if (marker) {
                    marker.setPosition(results[0].geometry.location);
                }
            }
        });
    };

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null);
    }, []);

    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            });

            setValue("latitude", latitude);
            setValue("longitude", longitude);
        }

        const fetchData = async () => {
            if (type === "edit" || type === "show" || type === "destroy") {
                await EditAction(route("round.show", id)).then((response) => {
                    if (response.status) {
                        reset({
                            latitude: response.data.latitude,
                            longitude: response.data.longitude,
                            complex_id: response.data.complex_id,
                        });

                        setLatitude(response.data.latitude);
                        setLongitude(response.data.longitude);

                        marker.setPosition({
                            lat: response.data.latitude,
                            lng: response.data.longitude,
                        });
                    }
                });
            }

            type === "create" && reset();

            type === "show" ? setDisabled(true) : setDisabled(false);
        };

        reset({});
        setCoods(null);

        modal && fetchData();
    }, [map, modal]);

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
                            <p>
                                ¿Esta seguro que desea eliminar este registro?
                            </p>
                        ) : (
                            <div>
                                {isLoaded ? (
                                    <div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <InputSelectGoogle
                                                value={coods}
                                                onChange={onSearch}
                                                label="Buscar dirección"
                                                disabled={disabled}
                                            />

                                            <InputSelectAsync
                                                route={route(
                                                    "complex.select_list"
                                                )}
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

                                        <div className="mt-6">
                                            <GoogleMap
                                                value={coods}
                                                mapContainerStyle={{
                                                    width: "100%",
                                                    height: "300px",
                                                }}
                                                center={{
                                                    lat: latitude
                                                        ? latitude
                                                        : -34.397,
                                                    lng: longitude
                                                        ? longitude
                                                        : 150.644,
                                                }}
                                                zoom={16}
                                                onLoad={onLoad}
                                                onUnmount={onUnmount}
                                                options={{
                                                    styles: mapStyle,
                                                    disableDefaultUI: true,
                                                    zoomControl: false,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-pulse bg-gray-200 h-96 w-full"></div>
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
                </ModalBody>
            </ModalContent>
        </ModalChakra>
    );
}

const mapStyle = [
    {
        featureType: "water",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#d3d3d3",
            },
        ],
    },
    {
        featureType: "transit",
        stylers: [
            {
                color: "#808080",
            },
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [
            {
                visibility: "on",
            },
            {
                color: "#b3b3b3",
            },
        ],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#ffffff",
            },
        ],
    },
    {
        featureType: "road.local",
        elementType: "geometry.fill",
        stylers: [
            {
                visibility: "on",
            },
            {
                color: "#ffffff",
            },
            {
                weight: 1.8,
            },
        ],
    },
    {
        featureType: "road.local",
        elementType: "geometry.stroke",
        stylers: [
            {
                color: "#d7d7d7",
            },
        ],
    },
    {
        featureType: "poi",
        elementType: "geometry.fill",
        stylers: [
            {
                visibility: "on",
            },
            {
                color: "#ebebeb",
            },
        ],
    },
    {
        featureType: "administrative",
        elementType: "geometry",
        stylers: [
            {
                color: "#a7a7a7",
            },
        ],
    },
    {
        featureType: "road.arterial",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#ffffff",
            },
        ],
    },
    {
        featureType: "road.arterial",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#ffffff",
            },
        ],
    },
    {
        featureType: "landscape",
        elementType: "geometry.fill",
        stylers: [
            {
                visibility: "on",
            },
            {
                color: "#efefef",
            },
        ],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [
            {
                color: "#696969",
            },
        ],
    },
    {
        featureType: "administrative",
        elementType: "labels.text.fill",
        stylers: [
            {
                visibility: "on",
            },
            {
                color: "#737373",
            },
        ],
    },
    {
        featureType: "poi",
        elementType: "labels.icon",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "road.arterial",
        elementType: "geometry.stroke",
        stylers: [
            {
                color: "#d6d6d6",
            },
        ],
    },
    {
        featureType: "road",
        elementType: "labels.icon",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {},
    {
        featureType: "poi",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#dadada",
            },
        ],
    },
];
