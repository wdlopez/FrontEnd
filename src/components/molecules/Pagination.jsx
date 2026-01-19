import React from "react";

function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex justify-center items-center mt-2 space-x-2">
      <button
        className={`btn btn-gray1  ${currentPage === 1
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-500 dark:hover:bg-dark4"
          }`}
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        <p className="flex items-center">
          <span className="material-symbols-outlined">
            chevron_left
          </span> Anterior
        </p>
      </button>
      <span className="btn btn-gray1">
       <p> Página {currentPage} de {totalPages}</p>
      </span>
      <button
        className={`btn btn-gray1 ${currentPage === totalPages
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-500 dark:hover:bg-gray-600"
          }`}
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <p className="flex items-center">
          Siguiente<span className="material-symbols-outlined">
            chevron_right
          </span>
        </p>
      </button>
    </div>
  );
}

export default Pagination;
