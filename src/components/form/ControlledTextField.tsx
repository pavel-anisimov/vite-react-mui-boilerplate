import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";

import type { TextFieldProps } from "@mui/material";
import type { JSX } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/**
 * ControlledTextField is a wrapper component for a text field that integrates with React Hook Form's `Controller`.
 * It provides controlled form handling with added validation and helper text display.
 *
 * @param {Object} param0 The props for the ControlledTextField component.
 * @param {UseFormReturn<T>} param0.form The instance of React Hook Form's `useForm` return object, containing form control and methods.
 * @param {Path<T>} param0.name The name of the field as defined in the form's schema.
 * @param {string} param0.label The label text displayed for the text field.
 * @param {string} [param0.type="text"] The type of the input field (e.g., text, password).
 * @param {Object} [param0.props] Additional props to be passed to the TextField component.
 *
 * @return {JSX.Element} A controlled text field component with validation and error handling integrated.
 *
 * @constructor
 */
export default function ControlledTextField<T extends FieldValues>(
  {form, name, label, type = "text", ...props}: { form: UseFormReturn<T>; name: Path<T>; label: string; type?: string } & TextFieldProps
): JSX.Element {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          type={type}
          fullWidth
          margin="normal"
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          {...props}
        />
      )}
    />
  );
}
