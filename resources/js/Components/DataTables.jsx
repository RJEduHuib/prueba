import React from "react";
import DataTable from "react-data-table-component";
import TextInput from "@/Components/TextInput";
import { Link } from "@inertiajs/react";
import {
    FaAngleRight,
    FaAngleDoubleRight,
    FaAngleLeft,
    FaAngleDoubleLeft,
    FaRegEye,
} from "react-icons/fa";

import {
    RiArrowDropDownLine,
    RiDeleteBin2Line,
    RiPencilLine,
    RiEye2Line,
} from "react-icons/ri";

import PrimaryButton from "@/Components/PrimaryButton";

export default function DataTables({ url, columns, filter, reload, report }) {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [filterText, setFilterText] = React.useState("");
    const [filteredItems, setFilteredItems] = React.useState([]);
    const [totalRows, setTotalRows] = React.useState(0);
    const [perPage, setPerPage] = React.useState(10);
    const [currentPage, setCurrentPage] = React.useState(1);

    const fetchData = async (page) => {
        setLoading(true);
        const response = await axios.get(url, {
            params: {
                page: page,
                size: perPage,
                search: filterText,
            },
        });

        setData(response.data.data);
        setFilteredItems(response.data.data);
        setTotalRows(response.data.total);
        setCurrentPage(page);
        setLoading(false);
    };

    const handlePageChange = (page) => {
        fetchData(page);
        setCurrentPage(page);
    };

    const handlePerRowsChange = async (newPerPage, page) => {
        setLoading(true);

        const response = await axios.get(url, {
            params: {
                page: page,
                size: newPerPage,
                search: filterText,
            },
        });

        setData(response.data.data);
        setFilteredItems(response.data.data);
        setPerPage(newPerPage);
        setCurrentPage(page);
        setLoading(false);
    };

    const filterServerSide = (value) => {
        setLoading(true);

        const response = axios.get(url, {
            params: {
                page: perPage,
                search: value,
            },
        });

        setData(response.data.data);
        setFilteredItems(response.data.data);
        setTotalRows(response.data.total);
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData(1);

        if (reload) {
            //filterServerSide(filterText);
        }
    }, [filterText, reload]);

    return (
        <div>
            <div className="relative gap-2">
                <div className="flex items-center justify-between">
                    {filter && (
                        <div className="flex">
                            <TextInput
                                placeholder="Buscar"
                                type="text"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                    )}

                    {report && <div>{report}</div>}
                </div>
            </div>

            <DataTable
                className="border border-gray-200 mt-5"
                columns={columns}
                data={filteredItems}
                pagination
                progressPending={loading}
                fixedHeader={true}
                paginationComponentOptions={{
                    rowsPerPageText: "Filas por página:",
                    rangeSeparatorText: "de",
                    noRowsPerPage: false,
                    selectAllRowsItem: true,
                    selectAllRowsItemText: "Todos",
                }}
                noDataComponent={
                    <div className="flex items-center justify-center mb-10 mt-10">
                        <h2>No se encontraron datos</h2>
                    </div>
                }
                progressComponent={
                    <div className="flex items-center justify-center mb-10 mt-10">
                        <h2>Cargando...</h2>
                    </div>
                }
                customStyles={{
                    headCells: {
                        style: {
                            fontSize: "0.875rem",
                            fontWeight: "bold",
                            color: "black",
                        },
                    },
                    cells: {
                        style: {
                            fonySize: "0.875rem",
                        },
                    },
                }}
                sortIcon={<RiArrowDropDownLine className="ml-2" size={40} />}
                paginationIconNext={<FaAngleRight size={20} />}
                paginationIconLastPage={<FaAngleDoubleRight size={20} />}
                paginationIconPrevious={<FaAngleLeft size={20} />}
                paginationIconFirstPage={<FaAngleDoubleLeft size={20} />}
                striped={true}
                paginationServer={true}
                paginationTotalRows={totalRows}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
                paginationDefaultPage={currentPage}
                responsive={true}
                highlightOnHover={true}
                pointerOnHover={true}
                noHeader={true}
                fixedHeaderScrollHeight="calc(100vh - 300px)"
            />
        </div>
    );
}

export function TableButtons({ onEdit, onDelete, onShow }) {
    return (
        <div className="flex flex-wrap md:items-center md:justify-center gap-2">
            {onShow && (
                <button
                    onClick={onShow}
                    className="text-blue-500 focus:outline-none bg-blue-200 rounded p-1"
                    title="Ver"
                >
                    <RiEye2Line size={20} />
                </button>
            )}
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="text-amber-500 focus:outline-none bg-amber-200 rounded p-1"
                    title="Editar"
                >
                    <RiPencilLine size={20} />
                </button>
            )}

            {onDelete && (
                <button
                    onClick={onDelete}
                    className="text-red-500 focus:outline-none bg-red-200 rounded p-1"
                    title="Eliminar"
                >
                    <RiDeleteBin2Line size={20} />
                </button>
            )}
        </div>
    );
}

export function TableLink({ urlEdit, onDelete, onShow }) {
    return (
        <div className="flex flex-wrap md:items-center md:justify-center gap-2">
            {onShow && (
                <button
                    onClick={onShow}
                    className="text-blue-500 focus:outline-none bg-blue-200 rounded p-1"
                    title="Ver"
                >
                    <RiEye2Line size={20} />
                </button>
            )}
            {urlEdit && (
                <Link
                    className="text-amber-500 focus:outline-none bg-amber-200 rounded p-1"
                    title="Editar"
                    href={urlEdit}
                >
                    <RiPencilLine size={20} />
                </Link>
            )}

            {onDelete && (
                <button
                    onClick={onDelete}
                    className="text-red-500 focus:outline-none bg-red-200 rounded p-1"
                    title="Eliminar"
                >
                    <RiDeleteBin2Line size={20} />
                </button>
            )}
        </div>
    );
}
