import { FormControl, ValidationErrors } from '@angular/forms';

export const noWhitespaceValidator = (
  control: FormControl,
): ValidationErrors => {
  const isWhitespace = (control.value || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { required: true };
};
