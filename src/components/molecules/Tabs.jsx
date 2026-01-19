import React from "react";

export default function Tabs({ 
  items, 
  activeKey, 
  onChange, 
  className = "", 
  styles={
    activeItem:"bg-primary text-white border-primary",
    item:"bg-white dark:bg-dark2 text-letterGray dark:text-gray-100 border-customGray1 dark:border-dark4 hover:bg-customGray1 dark:hover:bg-dark3",
    container:" min-w-[200px] cursor-pointer border rounded-lg px-2 py-1 text-center shadow-sm"
  } }) {
  return (
    <div className={`flex overflow-x-auto gap-2 ${className}`}>
      {items.map((item) => (
        <div
          key={item.key}
          onClick={() => onChange(item.key)}
          className={`
            ${styles.container}
            ${activeKey === item.key
              ? styles.activeItem
              : styles.item
            }
          `}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
