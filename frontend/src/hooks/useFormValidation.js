import { useMemo, useState } from 'react';


export default function useFormValidation(schema, data) {
  const [touched, setTouched] = useState({});

  // Real-time errors derived from current data
  const errors = useMemo(() => {
    const result = schema.safeParse(data);
    if (result.success) return {};
    const flat = result.error.flatten().fieldErrors;
    return Object.fromEntries(
      Object.entries(flat).map(([field, msgs]) => [field, msgs[0]])
    );
  }, [schema, data]);

  
  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  
  const touchAll = (fields) =>
    setTouched((prev) => {
      const next = { ...prev };
      fields.forEach((f) => (next[f] = true));
      return next;
    });

  return { errors, touched, touch, touchAll };
}
