import { Label } from "@mui/icons-material";
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";

interface IOptionTypes {
  id: string;
  label: string;
  value: string;
  desc?: string;
}

interface IFormElementTypes {
  name: string;
  title: string;
  options: IOptionTypes[];
}

export default function RadioFieldElement({
  name,
  title,
  options
}: IFormElementTypes) {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext();

  /* const [theValue, setTheValue] = useState(control._defaultValues[name]);

  const handleChange = (event) => {
    console.log(event.target.value);

    setTheValue(event.target.value);
  }; */

  return (
    <Controller
      name={name}
      defaultValue=""
      control={control}
      render={({ field }) => (
        <FormControl fullWidth>
          <FormLabel sx={{my:1}}>{title}</FormLabel>
          <RadioGroup
            {...field}
            row
            onChange={(event, value) => field.onChange(value)}
            value={field.value}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          <FormHelperText>{String(errors[name]?.message ?? "")}</FormHelperText>
        </FormControl>
      )}
    />
  );
}
