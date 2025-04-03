export const isObjEmpty = (obj: object) => {
  return Object.keys(obj).length == 0;
};

export function toNumberOrUndefined(value: any): number | undefined {
  return value !== undefined ? Number(value) : undefined;
}
