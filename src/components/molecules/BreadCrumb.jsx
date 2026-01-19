import React from "react";
import { Link } from "react-router-dom";

export default function Breadcrumb({ paths }) {
  return (
    <nav aria-label="breadcrumb" className="container mt-4 px-0.5 flex justify-start">
      <ol className="w-full flex items-start space-x-2 text-sm text-gray-600">
        {paths.map((path, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            {index !== paths.length - 1 ? (
              <Link to={path.url} className="text-blue-600 hover:underline dark:text-cyan-200">
                {path.name}
              </Link>
            ) : (
              <span className="text-letterGray dark:text-white font-semibold">{path.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
