import { makeStore, setSidebarCollapsed, toggleSidebarCollapsed } from '@/store';

describe('makeStore', () => {
  describe('trạng thái ban đầu', () => {
    it('tạo store với reducer ui', () => {
      const store = makeStore();
      expect(store.getState().ui).toEqual({ sidebarCollapsed: false });
      expect(store.getState().toast).toEqual({ toasts: [] });
    });
  });

  describe('có dispatch', () => {
    it('đọc lại state mới sau khi dispatch toggleSidebarCollapsed', () => {
      const store = makeStore();
      store.dispatch(toggleSidebarCollapsed());
      expect(store.getState().ui.sidebarCollapsed).toBe(true);
    });

    it('đọc lại state mới sau khi dispatch setSidebarCollapsed', () => {
      const store = makeStore();
      store.dispatch(setSidebarCollapsed(true));
      store.dispatch(setSidebarCollapsed(false));
      expect(store.getState().ui.sidebarCollapsed).toBe(false);
    });

    it('tách state giữa hai store', () => {
      const first = makeStore();
      const second = makeStore();
      first.dispatch(toggleSidebarCollapsed());
      expect(first.getState().ui.sidebarCollapsed).toBe(true);
      expect(second.getState().ui.sidebarCollapsed).toBe(false);
    });
  });
});
