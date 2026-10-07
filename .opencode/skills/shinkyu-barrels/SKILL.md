---
name: shinkyu-barrels
description: Quy ước type và export của dự án shinkyu — chuỗi barrel bốn file khi thêm component, bố cục thư mục types/, type của hook cũng bắt buộc nằm ở types/, path alias @/*, và các luật TypeScript strict. Dùng skill này bất cứ khi task thêm hoặc đổi tên một component hay prop type, chạm vào bất kỳ barrel index.ts nào, báo lỗi thiếu export hoặc "cannot find module", hoặc hỏi cách export một type mới. Dùng nó mỗi khi tạo file mới dưới components/, types/, hooks/, constants/, lib/, utils/, services/, hay validates/, vì mỗi thư mục đó đều có index.ts phải cập nhật — nếu không, component sẽ vô hình với code trong app.
---

# shinkyu — type và barrel

Mọi thư mục trong shinkyu đều re-export qua một `index.ts`. Điều đó giữ import phẳng
(`@/components/ui`) nhưng tạo ra một việc lặp lại thường xuyên: **một file mới không được
export thì vô hình với phần còn lại của app.** Đây là cách repo này hỏng thường xuyên nhất.

## Chuỗi bốn file khi thêm một component

Thêm `components/ui/widget.tsx` nghĩa là sửa bốn file, theo thứ tự này:

```
1. components/ui/widget.tsx          phần cài đặt
2. components/ui/index.ts            export { Widget } from "./widget";
                                    export type { WidgetProps } from "@/types";
3. components/index.ts               re-export Widget + WidgetProps
4. types/index.ts                    export type * from "./widget.type";
```

Bước 2 làm nó khả dụng bên trong khu vực của nó. Bước 3 làm nó khả dụng cho code trong `app/`,
vốn chỉ import từ `@/components`. Bước 4 làm prop type resolve được.

Chỉ thêm một type? Chỉ bước 4. Thêm một constant? Chỉ `constants/index.ts`.

Sau khi sửa một barrel, **grep symbol để xác nhận nó đã vào đúng chỗ** — một mục barrel bị
bỏ sót trông y hệt bug của bundler và sẽ đẩy bạn đi debug sai tầng.

## Bố cục thư mục types/

Một file cho mỗi component, đặt tên `<name>.type.ts`, chứa props type của component đó cộng
với mọi union mà component đó cần.

```tsx
// types/button.type.ts
export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};
```

`types/index.ts` là danh sách re-export phẳng của mọi file type:

```ts
export type * from './button.type';
export type * from './input.type';
// …mỗi type một dòng, sắp theo alphabet
```

Dùng `export type * from`, không bao giờ `export *` — repo bật `isolatedModules: true`, và
re-export một value từ module chỉ chứa type sẽ làm build hỏng.

Một component cần type cục bộ vẫn nên khai báo chúng ở `types/<name>.type.ts`.
`create-member-dialog.tsx` re-export type của nó từ `@/types` thay vì khai báo cục bộ — đó
là pattern.

### Type của hook cũng nằm ở types/

Không có type hay interface nào được khai báo trong `hooks/` — kể cả type chỉ một hook dùng.
Đặt ở `types/<name>.type.ts`, thêm vào `types/index.ts`, rồi import lại:

```ts
// types/sort.type.ts
export type SortDirection = 'asc' | 'desc';
export interface SortState<K> {
  key: K | null;
  direction: SortDirection;
}

// hooks/useSort.ts
import type { SortState } from '@/types';
```

`hooks/index.ts` re-export type của hook từ `@/types`, không từ `./useX`:

```ts
export { useSort } from './useSort';
export type { SortState } from '@/types';
```

Type cùng domain nên gộp vào file type sẵn có thay vì tạo file mới — `UsePaginationResult`
sống trong `types/pagination.type.ts`, `UseConfirmResult` trong `types/confirm.type.ts`.
Tên type cục bộ quá chung (`Item`) thì đổi tên khi ra ngoài (`RemoteOptionItem`) để không
tràn namespace của `@/types`.

## Import

`tsconfig.json` map `@/*` tới repo root, nên alias tới được mọi thư mục top-level:

```tsx
import { Button } from '@/components/ui';
import type { ButtonProps } from '@/types';
import { sidebarText } from '@/constants';
```

Không bao giờ nhảy ra ngoài cây bằng đường dẫn tương đối (`../../components`) — alias là
quy ước, và đường dẫn tương đối vỡ ngay khi file di chuyển. Trong cùng một thư mục thì
anh/chị em tương đối ổn (`./sidebar-item`).

Tách import value và type. `import type { X } from "@/types"` cho type,
`import { X } from "@/components/ui"` cho value.

## TypeScript strict

`tsconfig.json` bật `strict: true`. Điều đó cấm `any` ngầm định và bắt buộc xử lý giá trị có
thể undefined.

- Không `any`. Nếu một shape bên thứ ba thực sự chưa biết, dùng `unknown` rồi thu hẹp.
- Ưu tiên discriminated union và object map `as const` hơn kiểu bị nới rộng.
- Helper ở top-level là các arrow function nhỏ khai báo phía trên component, như trong
  `sidebar-item.tsx` (`normalizePath`, `isHrefActive`). Chỉ tách ra module dùng chung khi đã
  có người gọi thứ hai.
- Literal điều khiển hành vi nằm ở `constants/` kèm chốt `as const`, kiểu từ `types/` —
  `sidebarNavigationGroups: SidebarNavigationGroup[]` và `sidebarText ... as const` là
  hình mẫu.

## Kiểm chứng

`npm run lint` bắt được import thừa và vấn đề có type-aware; `npx tsc --noEmit` là kiểm tra
trực tiếp khi bạn chỉ đang dời export đi. Sau mỗi lần sửa barrel, chạy cả hai — lỗi export
hiện ra lúc build, không phải trong file bạn vừa sửa.
