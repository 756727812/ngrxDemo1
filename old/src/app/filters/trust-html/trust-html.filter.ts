export const trustHtml = ($sce) => input => $sce.trustAsHtml(input)
trustHtml.$inject = ['$sce']
