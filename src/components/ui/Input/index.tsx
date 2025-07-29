import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={`w-full rounded-md border-gray-300 bg-white p-3 shadow-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-200 ${className ?? ""}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };