export function resolveFieldData(data: any, field: string): any {
  if (data && field) {
    if (field.indexOf('.') === -1) {
      return data[field];
    } else {
      const fields: string[] = field.split('.');
      let value = data;
      for (let i = 0, len = fields.length; i < len; i += 1) {
        if (value == null) {
          return null;
        }
        value = value[fields[i]];
      }
      return value;
    }
  }
  return null;
}

export function filter(value: any[], fields: any[], filterValue: string) {
  const filteredItems: any[] = [];

  if (value) {
    for (const item of value) {
      for (const field of fields) {
        const index = String(resolveFieldData(item, field))
          .toLowerCase()
          .indexOf(filterValue.toLowerCase());
        if (index > -1) {
          filteredItems.push(item);
          break;
        }
      }
    }
  }

  return filteredItems;
}
