export function couponStatus() {

  const statusMap: string[] = ['', '审核中', '审核拒绝', '发放中', '已领完', '已结束', '还未到领取时间']

  return (input: number) => statusMap[input]
}
