import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";

import type { TextFieldProps } from "@mui/material";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";


export default function ControlledTextField<T extends FieldValues>({
                                                                     form, name, label, type = "text", ...props
                                                                   }: { form: UseFormReturn<T>; name: Path<T>; label: string; type?: string } & TextFieldProps) {
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
