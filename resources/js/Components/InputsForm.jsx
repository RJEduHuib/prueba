import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import Checkbox from "@/Components/Checkbox";

import React from "react";

import { Controller } from "react-hook-form";
import Select from "react-select";
import AsyncSelect from "react-select/async";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { usePage } from "@inertiajs/react";

import {
    RiTaxiLine,
    RiTakeawayLine,
    RiWalkLine,
    RiUser2Line,
    RiHomeGearLine,
    RiShieldUserLine,
    RiErrorWarningLine,
} from "react-icons/ri";

function InputText({
    label = "",
    errors,
    name,
    control,
    rules,
    type,
    hidden,
    disabled,
    buttonDisable,
    onChange,
    min,
    loading,
    ...props
}) {
    return (
        <div>
            <InputLabel value={label} />

            <Controller
                name={name}
                control={control}
                rules={rules}
                defaultValue=""
                render={({ field }) => (
                    <TextInput
                        {...props}
                        hidden={hidden}
                        disabled={disabled}
                        {...field}
                        className={`block w-full ${
                            errors[name] ? "border-red-600" : ""
                        }`}
                        onChange={(e) => {
                            if (type === "file") {
                                field.onChange(e.target.files);
                                onChange && onChange(e.target.files);
                            } else {
                                field.onChange(e);
                                onChange && onChange(e);
                            }
                        }}
                        type={type}
                        buttonDisable={buttonDisable}
                        {...(type === "date" && {
                            min: min,
                        })}
                        loading={loading}
                        id={name}
                    />
                )}
            />

            {errors[name] && <InputError message={errors[name].message} />}
        </div>
    );
}

function InputSelectGoogle({ onChange, value, label, disabled }) {
    const apiKey = import.meta.env.GOOGLE_MAPS_API_KEY || "";

    return (
        <div>
            <InputLabel value={label} />
            <GooglePlacesAutocomplete
                apiKey={apiKey}
                apiOptions={{
                    language: "es",
                    region: "ec",
                    types: ["(cities)"],
                    geometry: "geometry",
                }}
                minLengthAutocomplete={3}
                autocompletionRequest={{
                    componentRestrictions: {
                        country: ["ec"],
                    },
                }}
                selectProps={{
                    isDisabled: disabled,
                    value: value,
                    onChange: onChange,
                    placeholder: "",
                    classNames: {
                        control: () =>
                            "border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm p-[0.11rem]",
                    },
                    loadingMessage: () => "Cargando...",
                    noOptionsMessage: () => "No hay opciones",
                    theme: (theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary25: "#fef3c7",
                            primary: "#f59e0b",
                            primary50: "transparent",
                        },
                    }),
                    styles: {
                        control: (provided, state) => ({
                            ...provided,
                            borderColor: provided.color,
                            ":focus": {
                                ...provided[":focus"],
                                borderColor: provided.color,

                                transition: "none",
                            },
                        }),
                        menu: (provided, state) => ({
                            ...provided,
                            backgroundColor: "white",
                            color: "black",
                            ":focus": {
                                outline: "none",
                            },
                        }),
                        option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                                ? "#f6ad55"
                                : provided.backgroundColor,
                            color: state.isSelected ? "white" : provided.color,
                            ":hover": {
                                ...provided[":hover"],
                                backgroundColor: state.isSelected
                                    ? "#f6ad55"
                                    : provided.backgroundColor,
                                color: state.isSelected
                                    ? "white"
                                    : provided.color,
                            },
                        }),
                        multiValueRemove: (provided, state) => ({
                            ...provided,
                            color: "white",
                            backgroundColor: "#f59e0b",
                            ":hover": {
                                ...provided[":hover"],
                                backgroundColor: "#f59e0b",
                                color: "#451a03",
                            },
                        }),
                        input: (base) => ({
                            ...base,
                            "input:focus": {
                                boxShadow: "none",
                            },
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            whiteSpace: "normal",
                            overflow: "visible",
                        }),
                    },
                }}
            />
        </div>
    );
}

function InputSelectAsync({
    label = "",
    errors,
    name,
    control,
    rules,
    multiple = false,
    disabled = false,
    route,
    id,
    onAction,
    className,
}) {
    const [options, setOptions] = React.useState([]);

    const loadOptions = async (inputValue) => {
        const response = await fetch(`${route}?search=${inputValue}&id=${id}`);

        const data = await response.json();

        const result = data.map((item) => ({
            label: item.label,
            value: item.id,
        }));

        setOptions(result);

        return result;
    };

    return (
        <div>
            <InputLabel value={label} />

            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({
                    field: { onChange, value },
                    fieldState: { error },
                }) => (
                    <AsyncSelect
                        cacheOptions={true}
                        loadOptions={loadOptions}
                        defaultOptions
                        isDisabled={disabled}
                        className={"block w-full" + className}
                        isMulti={multiple}
                        loadingMessage={() => "Cargando..."}
                        noOptionsMessage={() => "No hay opciones"}
                        theme={(theme) => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary25: "#fef3c7",
                                primary: "#f59e0b",
                                primary50: "transparent",
                            },
                        })}
                        onChange={(value) => {
                            if (multiple) {
                                onChange(value.map((option) => option.value));
                            } else {
                                onChange(value.value);
                            }
                            onAction && onAction(value);
                        }}
                        value={
                            multiple
                                ? options.filter(
                                      (option) =>
                                          value && value.includes(option.value),
                                  )
                                : options.find(
                                      (option) => option.value === value,
                                  )
                        }
                        placeholder=""
                        classNames={{
                            control: () =>
                                "border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded shadow-sm p-[0.11rem] text-sm",
                        }}
                        styles={{
                            control: (provided, state) => ({
                                ...provided,
                                borderColor: errors[name]
                                    ? "#e53e3e"
                                    : provided.borderColor,
                                ":focus": {
                                    ...provided[":focus"],
                                    borderColor: errors[name]
                                        ? "#e53e3e"
                                        : provided.borderColor,

                                    transition: "none",
                                },
                            }),
                            menu: (provided, state) => ({
                                ...provided,
                                backgroundColor: "white",
                                color: "black",
                                ":focus": {
                                    outline: "none",
                                },
                            }),
                            option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected
                                    ? "#f6ad55"
                                    : provided.backgroundColor,
                                color: state.isSelected
                                    ? "white"
                                    : provided.color,
                                ":hover": {
                                    ...provided[":hover"],
                                    backgroundColor: state.isSelected
                                        ? "#f6ad55"
                                        : provided.backgroundColor,
                                    color: state.isSelected
                                        ? "white"
                                        : provided.color,
                                },
                                fontSize: "0.875rem",
                            }),
                            multiValueRemove: (provided, state) => ({
                                ...provided,
                                color: "white",
                                backgroundColor: "#f59e0b",
                                ":hover": {
                                    ...provided[":hover"],
                                    backgroundColor: "#f59e0b",
                                    color: "#451a03",
                                },
                            }),
                            input: (base) => ({
                                ...base,
                                "input:focus": {
                                    boxShadow: "none",
                                },
                            }),
                            multiValueLabel: (base) => ({
                                ...base,
                                whiteSpace: "normal",
                                overflow: "visible",
                            }),
                        }}
                    />
                )}
            />

            {errors[name] && <InputError message={errors[name].message} />}
        </div>
    );
}

function InputSelectLoading({
    label = "",
    errors,
    name,
    route,
    multiple = false,
    disabled = false,
    onAction,
    className,
    loading,
    onChange,
    value,
}) {
    const [options, setOptions] = React.useState([]);

    const loadOptions = async (inputValue) => {
        const response = await fetch(`${route}?search=${inputValue}`);

        const data = await response.json();

        const result = data.map((item) => ({
            label: item.label,
            value: item.value,
        }));

        setOptions(result);

        return result;
    };
    return (
        <AsyncSelect
            cacheOptions={true}
            loadOptions={loadOptions}
            defaultOptions
            isDisabled={disabled}
            className={"block w-full" + className}
            isMulti={multiple}
            loadingMessage={() => "Cargando..."}
            noOptionsMessage={() => "No hay opciones"}
            theme={(theme) => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    primary25: "#fef3c7",
                    primary: "#f59e0b",
                    primary50: "transparent",
                },
            })}
            onChange={(value) => {
                if (multiple) {
                    onChange(value.map((option) => option.value));
                } else {
                    onChange(value.value);
                }
                onAction && onAction(value);
            }}
            value={
                multiple
                    ? options.filter(
                          (option) => value && value.includes(option.value),
                      )
                    : options.find((option) => option.value === value)
            }
            placeholder=""
            classNames={{
                control: () =>
                    "border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm p-[0.11rem] text-sm",
            }}
            styles={{
                control: (provided, state) => ({
                    ...provided,
                    borderColor: provided.borderColor,
                    ":focus": {
                        ...provided[":focus"],
                        borderColor: provided.borderColor,

                        transition: "none",
                    },
                }),
                menu: (provided, state) => ({
                    ...provided,
                    backgroundColor: "white",
                    color: "black",
                    ":focus": {
                        outline: "none",
                    },
                }),
                option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected
                        ? "#f6ad55"
                        : provided.backgroundColor,
                    color: state.isSelected ? "white" : provided.color,
                    ":hover": {
                        ...provided[":hover"],
                        backgroundColor: state.isSelected
                            ? "#f6ad55"
                            : provided.backgroundColor,
                        color: state.isSelected ? "white" : provided.color,
                    },
                    fontSize: "0.875rem",
                }),
                multiValueRemove: (provided, state) => ({
                    ...provided,
                    color: "white",
                    backgroundColor: "#f59e0b",
                    ":hover": {
                        ...provided[":hover"],
                        backgroundColor: "#f59e0b",
                        color: "#451a03",
                    },
                }),
                input: (base) => ({
                    ...base,
                    "input:focus": {
                        boxShadow: "none",
                    },
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    whiteSpace: "normal",
                    overflow: "visible",
                }),
            }}
        />
    );
}

function InputSelect({
    label = "",
    errors,
    name,
    control,
    rules,
    options,
    multiple = false,
    disabled = false,
}) {
    return (
        <div>
            <InputLabel value={label} />

            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({
                    field: { onChange, value },
                    fieldState: { error },
                }) => (
                    <Select
                        isDisabled={disabled}
                        options={options}
                        className="block w-full"
                        isMulti={multiple}
                        loadingMessage={() => "Cargando..."}
                        noOptionsMessage={() => "No hay opciones"}
                        theme={(theme) => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary25: "#fef3c7",
                                primary: "#f59e0b",
                                primary50: "transparent",
                            },
                        })}
                        onChange={(value) => {
                            if (multiple) {
                                onChange(value.map((option) => option.value));
                            } else {
                                onChange(value.value);
                            }
                        }}
                        value={
                            multiple
                                ? options.filter(
                                      (option) =>
                                          value && value.includes(option.value),
                                  )
                                : options.find(
                                      (option) => option.value === value,
                                  )
                        }
                        placeholder=""
                        classNames={{
                            control: () =>
                                "border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm p-[0.11rem]",
                        }}
                        styles={{
                            control: (provided, state) => ({
                                ...provided,
                                borderColor: errors[name]
                                    ? "#e53e3e"
                                    : provided.borderColor,
                                ":focus": {
                                    ...provided[":focus"],
                                    borderColor: errors[name]
                                        ? "#e53e3e"
                                        : provided.borderColor,

                                    transition: "none",
                                },
                            }),
                            menu: (provided, state) => ({
                                ...provided,
                                backgroundColor: "white",
                                color: "black",
                                ":focus": {
                                    outline: "none",
                                },
                            }),
                            option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected
                                    ? "#f6ad55"
                                    : provided.backgroundColor,
                                color: state.isSelected
                                    ? "white"
                                    : provided.color,
                                ":hover": {
                                    ...provided[":hover"],
                                    backgroundColor: state.isSelected
                                        ? "#f6ad55"
                                        : provided.backgroundColor,
                                    color: state.isSelected
                                        ? "white"
                                        : provided.color,
                                },
                            }),
                            multiValueRemove: (provided, state) => ({
                                ...provided,
                                color: "white",
                                backgroundColor: "#f59e0b",
                                ":hover": {
                                    ...provided[":hover"],
                                    backgroundColor: "#f59e0b",
                                    color: "#451a03",
                                },
                            }),
                            input: (base) => ({
                                ...base,
                                "input:focus": {
                                    boxShadow: "none",
                                },
                            }),
                            multiValueLabel: (base) => ({
                                ...base,
                                whiteSpace: "normal",
                                overflow: "visible",
                            }),
                        }}
                    />
                )}
            />

            {errors[name] && <InputError message={errors[name].message} />}
        </div>
    );
}

function InputCheckBox({
    label,
    errors,
    message,
    name,
    control,
    rules,
    disabled,
}) {
    return (
        <div>
            <InputLabel value={label} />

            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) => (
                    <div className="block mt-1">
                        <label className="flex items-center">
                            <Checkbox
                                {...field}
                                checked={field.value}
                                onChange={(e) => {
                                    field.onChange(e.target.checked);
                                }}
                                disabled={disabled}
                            />
                            <span className="ml-2 text-sm ">{message}</span>
                        </label>
                    </div>
                )}
            />

            {errors[name] && <InputError message={errors[name].message} />}
        </div>
    );
}

function InputCKEditor({
    label,
    errors,
    name,
    control,
    rules,
    disabled = false,
}) {
    return (
        <div>
            <InputLabel value={label} />

            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) => (
                    <CKEditor
                        editor={ClassicEditor}
                        data={field.value}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            field.onChange(data);
                        }}
                        disabled={disabled}
                    />
                )}
            />

            {errors[name] && <InputError message={errors[name].message} />}
        </div>
    );
}

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function InputFile({ control, name, label, rules, errors }) {
    const { csrf_token } = usePage().props;

    return (
        <div>
            <InputLabel value={label} />

            <Controller
                name={name}
                control={control}
                rules={rules}
                defaultValue={[]}
                render={({ field }) => (
                    <FilePond
                        {...field}
                        server={{
                            process: {
                                url: route("visit.uploadImages"),
                                headers: {
                                    "X-CSRF-TOKEN": csrf_token,
                                },
                                onload: (response) => {
                                    const data = JSON.parse(response);
                                    field.onChange([
                                        ...field.value,
                                        data.file_name,
                                    ]);
                                },
                            },
                            revert: {
                                url: route("visit.DeleteImages"),
                                headers: {
                                    "X-CSRF-TOKEN": csrf_token,
                                },
                                onload: (response) => {
                                    const data = JSON.parse(response);
                                    field.onChange(
                                        field.value.filter(
                                            (item) => item !== data.file_name,
                                        ),
                                    );
                                },
                            },
                        }}
                        allowMultiple={true}
                        allowReorder={true}
                        allowRemove={true}
                        allowReplace={true}
                        maxFiles={4}
                        labelIdle='Arrastra y suelta tus archivos o <span class="filepond--label-action"> Buscar </span>'
                    />
                )}
            />

            {errors[name] && <InputError message={errors[name].message} />}
        </div>
    );
}

function InputVisitType({ control, name, label, rules, errors, watch }) {
    return (
        <div>
            <InputLabel value={label} />

            <ItemRadio
                control={control}
                name={name}
                watch={watch}
                label="Delivery"
                icon={RiTakeawayLine}
                rules={rules}
            />

            <ItemRadio
                control={control}
                name={name}
                watch={watch}
                label="Taxi"
                icon={RiTaxiLine}
                rules={rules}
            />

            <ItemRadio
                control={control}
                name={name}
                watch={watch}
                label="Visita"
                icon={RiWalkLine}
                rules={rules}
            />

            <ItemRadio
                control={control}
                name={name}
                watch={watch}
                label="Empleado"
                icon={RiUser2Line}
                rules={rules}
            />

            <ItemRadio
                control={control}
                name={name}
                watch={watch}
                label="Empresa"
                icon={RiHomeGearLine}
                rules={rules}
            />

            <ItemRadio
                control={control}
                name={name}
                watch={watch}
                label="Servicios"
                icon={RiShieldUserLine}
                rules={rules}
            />

            <ItemRadio
                control={control}
                name={name}
                watch={watch}
                label="Otros"
                icon={RiErrorWarningLine}
                rules={rules}
            />

            {errors[name] && <InputError message={errors[name].message} />}
        </div>
    );
}

function ItemRadio({ control, name, watch, label, icon, rules }) {
    return (
        <label className="inline-flex flex-col items-center text-center mx-2 mt-2">
            <Controller
                name={name}
                control={control}
                defaultValue=""
                rules={rules}
                render={({ field }) => (
                    <input
                        title={label}
                        {...field}
                        type="radio"
                        value={label}
                        className="form-radio h-0 w-0 opacity-0 absolute"
                    />
                )}
            />
            <div className="flex items-center justify-center">
                {icon &&
                    React.createElement(icon, {
                        size: 30,
                        className: `text-center ${
                            watch(name) === label ? "text-amber-500" : ""
                        }`,
                    })}
            </div>
            <span className="text-xs">{label}</span>
        </label>
    );
}

function InputSelectSimple({
    name,
    options,
    multiple = false,
    disabled = false,
    onAction,
    value,
    onChange,
}) {
    return (
        <Select
            isDisabled={disabled}
            options={options}
            className="block w-full"
            isMulti={multiple}
            loadingMessage={() => "Cargando..."}
            noOptionsMessage={() => "No hay opciones"}
            theme={(theme) => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    primary25: "#fef3c7",
                    primary: "#f59e0b",
                    primary50: "transparent",
                },
            })}
            onChange={(value) => {
                if (multiple) {
                    onChange(value.map((option) => option.value));
                } else {
                    onChange(value.value);
                }
                onAction && onAction(value);
            }}
            value={
                multiple
                    ? options.filter(
                          (option) => value && value.includes(option.value),
                      )
                    : options.find((option) => option.value === value)
            }
            placeholder=""
            classNames={{
                control: () =>
                    "border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm p-[0.11rem]",
            }}
            styles={{
                control: (provided, state) => ({
                    ...provided,
                    borderColor: provided.borderColor,
                    ":focus": {
                        ...provided[":focus"],
                        borderColor: provided.borderColor,

                        transition: "none",
                    },
                }),
                menu: (provided, state) => ({
                    ...provided,
                    backgroundColor: "white",
                    color: "black",
                    ":focus": {
                        outline: "none",
                    },
                }),
                option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected
                        ? "#f6ad55"
                        : provided.backgroundColor,
                    color: state.isSelected ? "white" : provided.color,
                    ":hover": {
                        ...provided[":hover"],
                        backgroundColor: state.isSelected
                            ? "#f6ad55"
                            : provided.backgroundColor,
                        color: state.isSelected ? "white" : provided.color,
                    },
                }),
                multiValueRemove: (provided, state) => ({
                    ...provided,
                    color: "white",
                    backgroundColor: "#f59e0b",
                    ":hover": {
                        ...provided[":hover"],
                        backgroundColor: "#f59e0b",
                        color: "#451a03",
                    },
                }),
                input: (base) => ({
                    ...base,
                    "input:focus": {
                        boxShadow: "none",
                    },
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    whiteSpace: "normal",
                    overflow: "visible",
                }),
            }}
        />
    );
}

export {
    InputText,
    InputCheckBox,
    InputSelect,
    InputSelectAsync,
    InputSelectGoogle,
    InputCKEditor,
    InputFile,
    InputVisitType,
    InputSelectLoading,
    InputSelectSimple,
};
