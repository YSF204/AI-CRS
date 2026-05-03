const PROFILE_FIELDS = [
  { field: "firstName", weight: 20 },
  { field: "lastName", weight: 20 },
  { field: "email", weight: 15 },
  {
    field: "telephone",
    weight: 15,
    check: (val) => Array.isArray(val) && val.length > 0,
  },
  { field: "gender", weight: 10 },
  { field: "age", weight: 10, check: (val) => val && val > 0 },
  {
    field: "profilePic",
    weight: 10,
    check: (val) => val && val.length > 0,
  },
];

export function calcProfileCompletion(user) {
  let completedScore = 0;
  let totalWeight = 0;

  PROFILE_FIELDS.forEach(({ field, weight, check }) => {
    totalWeight += weight;
    const fieldValue = user?.[field];
    const isCompleted = check
      ? check(fieldValue)
      : fieldValue && fieldValue.toString().trim().length > 0;
    if (isCompleted) completedScore += weight;
  });

  return Math.round((completedScore / totalWeight) * 100);
}
