export function groupStatus() {
  const statusMap: string[] = ['', '待开始', '活动中', '已结束'];
  return (input: number) => statusMap[input];
}
