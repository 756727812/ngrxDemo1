export default function webPService() {
  return {
    webPSupport(): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const local_has_webp_value = localStorage.getItem('hasWebP');
        if (local_has_webp_value) {
          resolve(Boolean(+local_has_webp_value));
        } else {
          let hasWebP: boolean = false;
          const img = new Image();
          img.onload = function() {
            hasWebP = !!(img.height > 0 && img.width > 0);
            localStorage.setItem('hasWebP', `${+hasWebP}`);
            resolve(hasWebP);
          };
          img.onerror = function() {
            hasWebP = false;
            localStorage.setItem('hasWebP', '0');
            reject(hasWebP);
          };
          img.src =
            'data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==';
        }
      });
    },
  };
}
