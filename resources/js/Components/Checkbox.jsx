export default function Checkbox({ className = "", ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                "rounded-none border-gray-300 text-amber-600 shadow-sm focus:ring-amber-500 " +
                className
            }
        />
    );
}
