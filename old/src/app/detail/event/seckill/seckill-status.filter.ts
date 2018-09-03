export function seckillStatus() {
  const statusMap: string[] = ['', '待开始', '进行中', '已结束', '强制结束'];
  return (input: number) => statusMap[input];
}
