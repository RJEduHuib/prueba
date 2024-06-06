function Default({ label }) {
    return (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
            {label}
        </span>
    );
}

function Success({ label }) {
    return (
        <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
            {label}
        </span>
    );
}

function Danger({ label }) {
    return (
        <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
            {label}
        </span>
    );
}

function Warning({ label }) {
    return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
            {label}
        </span>
    );
}

function Info({ label }) {
    return (
        <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-900 dark:text-gray-300">
            {label}
        </span>
    );
}

export default function Badge({ label, type }) {
    switch (type) {
        case "success":
            return <Success label={label} />;
        case "danger":
            return <Danger label={label} />;
        case "warning":
            return <Warning label={label} />;
        case "info":
            return <Info label={label} />;
        default:
            return <Default label={label} />;
    }
}
