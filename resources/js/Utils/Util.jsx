import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";

function TitleModal({ type }) {
    return (
        <div className="flex justify-between">
            <h2 className="text-lg font-medium text-gray-900 uppercase">
                {type === "create" && "Crear Registro"}
                {type === "edit" && "Editar Registro"}
                {type === "destroy" && "Eliminar Registro"}
                {type === "show" && "Mostrar Registro"}
            </h2>
        </div>
    );
}

function ButtonModal({ type, onClose, onSubmit }) {
    return (
        <div className="mt-6 flex justify-end mb-2">
            <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
            {type === "create" && (
                <PrimaryButton className="ml-3" disabled={onSubmit}>
                    Crear
                </PrimaryButton>
            )}
            {type === "edit" && (
                <PrimaryButton className="ml-3" disabled={onSubmit}>
                    Editar
                </PrimaryButton>
            )}
            {type === "destroy" && (
                <DangerButton
                    className="ml-3"
                    disabled={onSubmit}
                    type="submit"
                >
                    Eliminar
                </DangerButton>
            )}
        </div>
    );
}

const CreateAction = async (url, data) => {
    const response = await axios.post(url, data);

    return response.data;
};

const UpdateAction = async (url, data) => {
    const response = await axios.post(url, data);

    return response.data;
};

const ShowAction = async (url) => {
    const response = await axios.get(url);

    return response.data;
};

const EditAction = async (url) => {
    const response = await axios.get(url);

    return response.data;
};

const DeleteAction = async (url) => {
    const response = await axios.delete(url);

    return response.data;
};

export {
    TitleModal,
    ButtonModal,
    EditAction,
    ShowAction,
    UpdateAction,
    CreateAction,
    DeleteAction,
};
