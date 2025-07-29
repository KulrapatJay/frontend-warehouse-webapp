import * as React from "react";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
  
>(({ className, children, ...props }, ref) => {

  return (
    <label ref={ref} className={`label ${className ?? ""}`} {...props}>
      <span className="label-text">{children}</span>
    </label>
  );
});
Label.displayName = "Label";

export { Label };