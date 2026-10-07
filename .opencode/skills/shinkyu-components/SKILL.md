---
name: shinkyu-components
description: Quy ước component và hook của dự án shinkyu — khi nào thêm "use client", pattern inject renderIcon, nối label bằng useId, state có kiểm soát với giá trị mặc định suy ra, thuộc tính accessibility, luật component chỉ render chứ không quyết định, và CRUD qua hooks/api/useApi (useGet/usePost/usePut/useDelete bọc axios + TanStack Query). Dùng skill này bất cứ khi task tạo hoặc sửa một file dưới components/ hoặc hooks/, dựng form, dialog, table, nav item, hay date picker, gọi API CRUD, hoặc hỏi nên cấu trúc một phần UI tái sử dụng ở đây thế nào. Cũng dùng khi một component đang lỗi hydration hoặc lỗi a11y.
---

# shinkyu — component

Component trong repo này **chỉ render, không quyết định.** Mọi danh sách option, label, và
thông báo validate thuộc về `constants/`, kiểu dữ liệu lấy từ `types/`. Đó là lý do
`constants/sidebar.constant.ts` giữ cả cây nav lẫn một object `sidebarText` chứa UI copy
tiếng Nhật — component vẫn thuần renderer, còn toàn bộ nội dung của tính năng sửa được ở
một file.

```
components/ui/         primitive: Button, Input, Select, Modal, TableData, DatePicker, Pagination…
components/layout/     chrome của app: AppShell, Header, Sidebar (+ subfolder sidebar/)
components/forms/      dialog theo tính năng: CreateMemberDialog
components/dashboard/  nội dung trang: HomeDashboard, mock-data
components/shared/     Icon
components/providers/  StoreProvider, QueryProvider
```

## Server hay client

`"use client"` nằm ở dòng đầu của mọi component dùng state, effect, event handler, hoặc
browser API. `sidebar-item.tsx`, `create-member-dialog.tsx`, `modal.tsx` đều có nó. Giữ file
page trong `app/` là server component và ủy thác — xem skill `shinkyu-next` cho phía route.

Thêm `"use client"` chỗ không cần sẽ kéo client JS tới thứ vốn có thể render ở server. Cả
hai chiều đều đáng bắt trong review.

## Những pattern đã có trong codebase

**Inject renderer thay vì import.** `SidebarProps.renderIcon: RenderIcon` nghĩa là parent
quyết định cách vẽ icon, nên sidebar không phụ thuộc SVG và vẫn test được. Theo khi một
component vốn sẽ hard-code một hình ảnh mà shell nên sở hữu:

```tsx
export type RenderIcon = (name: RenderIconName, className?: string) => ReactNode;
```

**Nối label bằng `useId`.** `create-member-dialog.tsx` dựng id field từ nó:

```tsx
const formId = useId();
const fieldId = (name: keyof MemberFormValues) => `${formId}-${name}`;
```

`sidebar-item.tsx` làm điều tương tự cho `aria-controls` của danh sách submenu.

**State có kiểm soát với giá trị mặc định suy ra.** Cho phép người dùng ghi đè state từ
server mà không mutate nó:

```tsx
const [isExpandedOverride, setIsExpandedOverride] = useState<boolean | null>(null);
const isExpanded = isExpandedOverride ?? (hasSubItems && (isActive || isSubItemActive));
```

**Helper nhỏ ở đầu file.** `normalizePath` và `isHrefActive` trong `sidebar-item.tsx` nằm
phía trên component dưới dạng arrow function. Hãy noi theo thay vì nhúng logic vào JSX.

**Primitive nhận `className` và spread props** để caller ghép được — xem `Button`.

## Accessibility là một phần của component, không phải việc làm sau

- Nút mở/đóng: `aria-expanded` + `aria-controls` + `aria-label` có mô tả
  (`sidebarText.subItems.open/close` dựng ra chúng).
- Link nav đang active: `aria-current="page"`.
- Nút đang loading: `aria-busy="true"` kèm `disabled`, và handler không được bắn.
- Mọi control của form cần label được liên kết qua `useId()`.

Test query theo role và accessible name, nên thiếu thuộc tính `aria-*` sẽ làm suite fail —
đó là chủ đích, không phải phiền.

## Form

`components/forms/create-member-dialog.tsx` là bản tham chiếu: state cục bộ `values` /
`errors` / `pending`, một `updateValue` có kiểu sẵn sàng xoá lỗi của field ngay khi nó được
sửa, validate import từ `constants/member-form.constant.ts`, và ghép từ primitive
(`Input`, `Select`, `DatePicker`, `TextArea`, `Modal`) thay vì phần tử thô. Form mới có
thể dùng `hooks/useZodForm` (schema zod → `values`/`errors`/`isSubmitting`/`handleSubmit`)
thay cho state tay; validate thuần đặt ở `validates/`, message ở `constants/`.

## State toàn cục

UI state dùng chung (sidebar thu gọn, toast) nằm trong Redux Toolkit ở `store/`
(`slices/` + `stores/`, persist bằng `redux-persist`). Server data đi qua TanStack Query
(`hooks/api/useApi`), **không** đưa vào Redux. State chỉ một component cần thì giữ `useState`.

## Hooks

`hooks/` chứa hook tái sử dụng; type của mọi hook nằm ở `types/` (xem skill
`shinkyu-barrels`), file hook chỉ `import type { X } from '@/types'`.

**Gọi API qua `hooks/api/useApi`.** Mọi request — CRUD lẫn mutation khác (login, forgot-password) —
đi qua `useGet` (query) và `usePost`/`usePut`/`useDelete` (mutation), bọc `axios_instance` +
TanStack Query. Không viết tay `useQuery`/`useMutation`, không gọi `axios_instance` hay
`xxxService` trực tiếp từ hook, không `try/catch` quanh API.

```tsx
// CRUD: query + mutation kèm invalidate
const { data, isPending } = useGet<Member[]>(['members'], '/members');
const create = usePost<void, CreateMemberPayload>('/members', {
  invalidateKeys: ['members'], // invalidate sau success
  onSuccess: () => close(), // callback của caller vẫn chạy
});
create.mutate(payload);

// Mutation không CRUD: lỗi đọc từ error, không bắt bằng try/catch
const login = usePost<AuthTokens, LoginPayload>('/auth/login', {
  onSuccess: (tokens) => {
    axiosClient.setSession(tokens);
    router.replace(redirectTo);
  },
});
const onSubmit = form.handleSubmit((data) => login.mutate(data));
// submitError: login.error?.message ?? null
```

- `onSubmit` gọi `mutate` (không `mutateAsync`); side effect thành công đặt trong `onSuccess`.
- `queryKey` của `useGet` lấy từ `services/query-keys.ts`.
- `url` của mutation nhận cả hàm `((variables) => string)` cho path param.
- `config` (`AxiosRequestConfig`) truyền thêm ở tham số cuối cho mọi hook.
- Lỗi đã normalize thành `ApiError` (`utils/api-validation-error`); đọc `error.message` /
  `getFieldErrors(error)`. Trạng thái lấy từ `isPending` / `isSuccess` / `error`, không tự quản cờ.

Hook không gọi API (state cục bộ, form, dialog…) khai báo tuần tự như các file hook
khác; luôn kèm `"use client"`.

## Kiểm chứng

`npm run lint` và `npm run test:ci`. Nếu bạn thêm hoặc đổi một component, nó cần test ở
đường dẫn tương ứng dưới `__tests__/` — xem skill `shinkyu-testing`.
