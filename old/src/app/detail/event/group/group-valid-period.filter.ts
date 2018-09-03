export function groupValidPeriod() {
  return (input: number) => {
    const termOfValidityHours = input >= 60 ? `${Math.floor(input / 60)}小时` : ''
    const minutes = input % 60
    const termOfValidityMinutes = minutes ? `${minutes}分` : ''
    return `${termOfValidityHours}${termOfValidityMinutes}`
  }
}
