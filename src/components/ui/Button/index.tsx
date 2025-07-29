import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`btn btn-lg btn-primary border-none font-bold shadow-md transition-all duration-200 ease-in-out hover:shadow-lg active:scale-95 active:shadow-sm ${className ?? ""}`}       
        {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };