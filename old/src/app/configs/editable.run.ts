editableRun.$inject = ['editableOptions', 'editableThemes'];
export function editableRun(editableOptions, editableThemes) {
  editableOptions.theme = 'bs3';
  editableThemes.bs3.buttonsClass = 'btn-sm';
}
