export function orderGrouponStatus() {

  const statusMap: string[] = ['', '拼团中', '拼团成功', '拼团失败']

  return (input: number) => statusMap[input]
}
