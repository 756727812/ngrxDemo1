import { AbstractControl, Validators } from '@angular/forms';
import { containSpecial, productIdValid } from '../services/utils.service';
import * as moment from 'moment';

export function dateValidator(readonly: boolean = false) {
  return (c: AbstractControl) => {
    const date = c.value;
    if (!date) {
      return {
        required: true,
      };
    }

    if (date[0] === null) {
      return {
        required: true,
      };
    }

    const start = date[0];
    const end = date[1];
    const now = Date.now();

    if (!readonly) {
      if (+start <= now) {
        return {
          ltn: true,
        };
      }
    }

    if (+start === +end) {
      return {
        eq: true,
      };
    }

    return null;
  };
}

export function singleDateValidator(isEnd?: boolean) {
  return (c: AbstractControl) => {
    const value = +c.value;
    const now = Date.now();
    if (!value) return { required: true };
    if (isEnd) {
      const maxTime = +moment(now).add(45, 'days');
      if (value > maxTime) return { overMaxDay: true };
    } else {
      if (value <= now) {
        return { startLessNow: true };
      }
    }
    return null;
  };
}

export function priceValidator(
  c: AbstractControl,
): { [key: string]: any } | null {
  const value = c.value;
  if (value === 0) {
    return {
      ltz: true,
    };
  }
  if (!Number(value)) {
    return {
      required: true,
    };
  }

  if (Number(value) <= 0) {
    return {
      ltz: true,
    };
  }

  if (Number(value) > 999999) {
    return {
      tlg: true,
    };
  }
  return null;
}

function getStrLen(text) {
  const strLen = text.length;
  let n = 0;
  const s = '';
  for (let i = 0; i < strLen; i = i + 1) {
    const a = text.charAt(i);
    n = n + 1;
    if (text.charCodeAt(i) > 256) {
      n = n + 1;
    }
  }
  return n;
}

export function productNameValidator(
  c: AbstractControl,
): { [key: string]: any } | null {
  const value: string = c.value.trim();
  if (!value) return { required: true };
  if (containSpecial.test(value)) {
    return {
      special: true,
    };
  }
  if (getStrLen(value) > 200) return { maxlength: true };

  return null;
}

export function groupNameValidator(c: AbstractControl) {
  const value = c.value ? c.value.trim() : '';
  if (!value) {
    return { required: true };
  }
  if (containSpecial.test(value)) return { special: true };
  if (value.length > 20) {
    return {
      maxlength: true,
    };
  }
}

export function dateGroupValidator(
  c: AbstractControl,
): { [key: string]: any } | null {
  const start = c.get('startTime');
  const end = c.get('endTime');
  if (!start || !end) return null;
  const startTime = +start.value;
  const endTime = +end.value;
  if (startTime && endTime && startTime >= endTime) {
    if (startTime >= endTime) {
      return { startOverEndtime: true };
    }
  }
  return null;
}

export function moneyValidator(
  c: AbstractControl,
): { [ksy: string]: any } | null {
  const targetPrice = c.get('targetPrice');
  const offPrice = c.get('offPrice');
  const targetPriceValue = +targetPrice.value;
  const offPriceValue = +offPrice.value;
  if (!targetPrice || !offPriceValue) return null;
  if (targetPriceValue <= offPriceValue)
    return { targetPriceLessOffPrice: true };
}

export function ruleValidator(c: AbstractControl): { [ksy: string]: any } | null {
  const value = c.value;
  const thresholdValueErrors = [];
  const discountValueErrors = [];
  value.forEach(
    (item,index,arr)=>{
      if(index >0){
        if(item.thresholdValue && arr[index-1].thresholdValue && item.thresholdValue <= arr[index-1].thresholdValue) {
          thresholdValueErrors.push(index);
        }
        if(item.discountValue && arr[index-1].discountValue && item.discountValue >= arr[index-1].discountValue) {
          discountValueErrors.push(index);
        }
      }
    }
  );
  if(thresholdValueErrors.length || discountValueErrors.length){
    return {thresholdValueErrors,discountValueErrors}
  }
  return null;
}


export function productIdValidator(
  c: AbstractControl,
): { [key: string]: any } | null {
  const ids = c.value || '';
  if (!ids) return null;
  const ret = productIdValid(ids, -1);
  if (ret === -1) {
    return { invalidCode: true };
  }
  return null;
}
