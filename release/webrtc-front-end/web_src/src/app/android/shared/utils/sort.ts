export const sortAndroidList = (list: { tag: string; create_date: string }[]): { key: number; tag: string }[] => {
  return list
    .sort((a: { tag: string; create_date: string }, b: { tag: string; create_date: string }): number =>
      b.create_date.localeCompare(a.create_date)
    )
    .map((item: any, i: number): { key: number; tag: string } => ({ key: i, tag: item.tag }));
};
