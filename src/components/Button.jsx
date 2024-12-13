import React from "react";

function Button({
  children,
  type = "button",
  bgcolor = "bg-blue-600",
  textcolor = "text-white",
  className = "",
  ...props
}) {
  return (
    <button className={`py-2 px-4 rounded-lg ${bgcolor} ${textcolor} ${className}`} {...props}>
        {children}
    </button>
  )
}

export default Button;
