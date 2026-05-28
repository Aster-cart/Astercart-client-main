import { useState } from "react";

export const useToggle = (initialState: Record<string, boolean> = {}) => {
  const [values, setValues] = useState<Record<string, boolean>>(initialState);

  const toggleValue = (key: string) => {
    setValues((prevValues) => ({
      ...prevValues,
      [key]: !prevValues[key],
    }));
  };
  return { values, toggleValue };
};
