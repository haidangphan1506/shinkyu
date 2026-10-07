import '@testing-library/jest-dom';

// jsdom không implement navigation: click vào <a href> sẽ log
// "Not implemented: navigation (except hash changes)". Chặn default để
// activation behavior của anchor không chạy; href dạng hash vẫn đi qua vì
// jsdom hỗ trợ hash. Test chạy environments node không có document.
if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const href = target.closest('a')?.getAttribute('href');
    if (href && !href.startsWith('#')) {
      event.preventDefault();
    }
  });
}
