/** Central query-key factory; keep keys hierarchical so `invalidateQueries` can target a prefix. */
export const queryKeys = {
  options: {
    all: ['options'] as const,
    corporates: () => [...queryKeys.options.all, 'corporates'] as const,
    licenses: () => [...queryKeys.options.all, 'licenses'] as const,
  },
};
