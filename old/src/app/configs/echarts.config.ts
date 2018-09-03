echartsConfig.$inject = ['$echartsProvider']

export function echartsConfig($echartsProvider) {
  $echartsProvider.setGlobalOption({
    driftPalette: false,
  })
}
