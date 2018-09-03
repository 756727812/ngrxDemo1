export function propsFilter() {
  return function (items, props) {
    let out = [];

    if (Array.isArray(items)) {
      const keys = Object.keys(props);

      items.forEach((item) => {
        let itemMatches = false;

        for (let i = 0; i < keys.length; i += 1) {
          const prop = keys[i];
          const text = props[prop].toLowerCase();
          if (~item[prop].toString().toLowerCase().indexOf(text)) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      out = items;
    }

    return out;
  };
}
