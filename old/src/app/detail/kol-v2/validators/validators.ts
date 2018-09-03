import { AbstractControl } from '@angular/forms';

export const cateNameValidator = (
  c: AbstractControl,
): { [key: string]: any } | null => {
  const value = (c.value || '').trim();
  if (!value) return { required: true };
  // const strLen = value.replace(/[\u4e00-\u9fa5]/g, 'xx').length;
  // if(strLen>12)return {required:true};
  if (value.length > 6) return { maxlength: true };
  return null;
};

export const mapCateValidator = (
  c: AbstractControl,
): { [key: string]: any } | null => {
  const ret = (c.value || []).every(r => !r.checked);
  if (ret) return { required: true };
  return null;
};
