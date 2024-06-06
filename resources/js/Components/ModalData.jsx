import Modal from "./Modal";
import SecondaryButton from "./SecondaryButton";
export function PersonInfoModal({ modal, onClose, person, title }) {
    return (
        <ModalBody modal={modal} onClose={onClose} title={title}>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <tbody>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                N. Cedula
                            </td>
                            <td className="border px-4 py-2">{person?.ci}</td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                Nombres y Apellidos
                            </td>
                            <td className="border px-4 py-2">{person?.name}</td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                F. Consulta
                            </td>
                            <td className="border px-4 py-2">
                                {person?.date_information}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </ModalBody>
    );
}

export function VehicleInfoModal({ modal, onClose, vehicle, title }) {
    return (
        <ModalBody modal={modal} onClose={onClose} title={title}>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <tbody>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                F. Ultima Matricula
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.last_date_enrollment}
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                F. Caducidad Matricula
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.date_expiration_enrollment}
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                Fecha Compra
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.date_buy}
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                F. Matricula Anual
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.date_enrollment_anual}
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                Cilindraje
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.cylinder}
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                Canton
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.canton}
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                Placa
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.plate}
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                Marca
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.brand}
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                Modelo
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.model}
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                Año Modelo
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.model_year}
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                Clase
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.class}
                            </td>
                        </tr>
                        <tr>
                            <td className="border px-4 py-2 font-bold">
                                Tipo de Vehiculo
                            </td>
                            <td className="border px-4 py-2">
                                {vehicle?.service}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </ModalBody>
    );
}

function ModalBody({ modal, onClose, children, title }) {
    return (
        <Modal show={modal} onClose={onClose} maxWidth="xl">
            <div className="p-6">
                <div className="flex justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                        {title}
                    </h2>
                </div>

                <div className="mt-4">{children}</div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Cerrar</SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}
