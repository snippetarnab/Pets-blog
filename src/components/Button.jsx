import React from "react";

function Button({
  children,
  type = "button",
  bgColor = "bg-blue-600",
  textcolor = "text-white",
  className = "",
  ...props
}) {
  return (
    <button className={`py-2 px-4 rounded-lg ${bgColor} ${textcolor} ${className}`} {...props}>
        {children}
    </button>
  )
}

export default Button;
