const typeCache: { [label: string]: boolean } = {};
export function type<T>(label: T | ''): T {
  if (typeCache[<string>label]) {
    throw new Error(`Action type "${label}" is not unique"`);
  }

  typeCache[<string>label] = true;

  return <T>label;
}

// var typeCache = {};
// function type(label) {
//     if (typeCache[label]) {
//          throw new Error("Action type \"" + label + "\" is not unique\"");
//     }
//     typeCache[label] = true;
//     return label;
// }