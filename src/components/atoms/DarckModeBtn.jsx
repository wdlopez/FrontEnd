import React from "react";

export default function DarkModeToggle({ darkMode, setDarkMode, type = "button" }) {
    const toggleTheme = () =>
        setDarkMode((prevTheme) => (prevTheme === "light" ? "dark" : "light"));

    if (type === "toggle") {
        return (
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={darkMode === "dark"}
                    onChange={toggleTheme}
                    className="sr-only peer"
                />
                {/* Track */}
                <div className="w-11 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:bg-gray-700 rounded-full transition-colors duration-300 peer-checked:bg-blue-600"></div>
                {/* Thumb */}
                <div className="absolute left-1 top-1.25 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
                <span className="ml-4 text-xl text-gray-300 dark:text-gray-300">
                    {darkMode === "light" ? (
                        <span className="material-symbols-outlined">dark_mode</span>
                    ) : (
                        <span className="material-symbols-outlined">light_mode</span>
                    )}
                </span>
            </label>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="px-4 py-2 border rounded transition-colors duration-300 bg-gray-200 border-slate-600 hover:text-white hover:bg-slate-600 dark:bg-gray-700 text-gray-800 dark:text-gray-200 dark:hover:bg-slate-100 dark:hover:text-slate-600"
        >
            {darkMode === "light" ? "Modo Oscuro" : "Modo Claro"}
        </button>
    );
}
