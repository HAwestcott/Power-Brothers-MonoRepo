export const projectTypeIds = [
  "urd",
  "urd-masterplan",
  "urd-stage-design",
  "option-2-public-lighting-design",
  "option-1-design",
  "earthing-assessment",
] as const;

export type ProjectTypeId = (typeof projectTypeIds)[number];
