import { forwardRef, useEffect, useRef, useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { CgSpinner } from "react-icons/cg";

export default forwardRef(function TextInput(
    {
        type = "text",
        className = "",
        isFocused = false,
        buttonDisable,
        loading = false,
        ...props
    },
    ref
) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    const [show, setShow] = useState(false);

    return type == "password" ? (
        <div className="relative">
            <input
                {...props}
                type={type === "password" ? (show ? "text" : "password") : type}
                className={
                    "border-gray-300 rounded focus:border-amber-500 focus:ring-amber-500 shadow-sm text-sm pr-10 " +
                    className
                }
                ref={input}
                autoComplete="off"
            />

            {type === "password" && (
                <button
                    type="button"
                    className="absolute top-0 right-0 h-full px-3 py-2 focus:outline-none"
                    onClick={() => setShow((prev) => !prev)}
                >
                    {show ? (
                        <RiEyeOffLine className="text-black" size={20} />
                    ) : (
                        <RiEyeLine className="text-black" size={20} />
                    )}
                </button>
            )}
        </div>
    ) : (
        <div className="flex relative">
            <input
                {...props}
                type={type}
                autoComplete="off"
                className={
                    "border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded shadow-sm flex-grow text-sm " +
                    className
                }
                ref={input}
            />

            {loading && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <CgSpinner
                        className="animate-spin text-amber-500"
                        size={24}
                    />
                </div>
            )}
        </div>
    );
});
