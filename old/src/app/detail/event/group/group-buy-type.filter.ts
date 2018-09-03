export function groupBuyType() {
  const statusMap: string[] = ['', '普通拼团', '新人团', '抽奖团', '超级团', '拉新团'];
  return (input: number) => statusMap[input];
}
