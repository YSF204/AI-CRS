import { useMemo, useState } from 'react';

/**
 * useFormValidation
 * 
 * Wraps Zod's safeParse to give you real-time per-field errors
 * and a touched map — so error messages only appear after the
 * user has interacted with a field.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {object} data  — the live form values to validate
 * @returns {{ errors, touched, touch, touchAll }}
 */
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

  /** Mark a single field as touched (call from onFocus or onBlur) */
  const touch = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  /** Mark a list of fields as touched at once (e.g. on "Next" click) */
  const touchAll = (fields) =>
    setTouched((prev) => {
      const next = { ...prev };
      fields.forEach((f) => (next[f] = true));
      return next;
    });

  return { errors, touched, touch, touchAll };
}
