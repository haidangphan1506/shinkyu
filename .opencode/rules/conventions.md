# Quy ước shinkyu

Chỉ mục. Chi tiết theo miền nằm trong skill — load skill, đừng đọc lại file này để tìm.

| Task chạm vào                                       | Skill                 |
| --------------------------------------------------- | --------------------- |
| `app/`, route, layout, metadata, `next.config.ts`   | `shinkyu-next`        |
| file mới, barrel `index.ts`, `types/`, import, type | `shinkyu-barrels`     |
| `.tsx`, `hooks/`, form, dialog, nav, a11y           | `shinkyu-components`  |
| axios, TanStack Query, gọi API qua `hooks/api/useApi`      | `shinkyu-components`  |
| `app/globals.css`, className, màu, dark mode        | `shinkyu-styling`     |
| `__tests__/`, coverage, test fail                   | `shinkyu-testing`     |
| commit, branch, diff, review                        | `git-workflow` (rule) |

## Bất biến cốt lõi

- **Chuỗi barrel 4 file.** component → `index.ts` khu vực → `components/index.ts` →
  `types/index.ts`. Không export = vô hình với `app/`. Grep sau mỗi lần sửa.
- **Type/interface chỉ khai báo ở `types/`.** Kể cả type cục bộ không export, state Redux, type suy ra từ zod —
  đặt ở `types/<name>.type.ts`, import lại bằng `import type { X } from '@/types'`. File
  hook/component không export type nào.
- **Message chỉ khai báo ở `constants/`.** Mọi chuỗi hiển thị cho người dùng (label, lỗi,
  toast, tiêu đề trang) — component/hook/util/page import từ `@/constants`.
- **Folder >12 file → chia subfolder theo feature.** Chi tiết: `folder-structure.md`.
- **Gọi API qua `hooks/api/useApi`.** `useGet`/`usePost`/`usePut`/`useDelete` bọc `axios_instance`
  + TanStack Query, dùng cho cả CRUD lẫn mutation khác (login, forgot-password). Không viết tay
  `useQuery`/`useMutation`, không `try/catch` quanh API; lỗi đọc từ `error.message`.
- **Component render, không quyết định.** Mọi literal và UI copy tiếng Nhật ở `constants/`,
  kiểu từ `types/`.
- **`app/` chỉ là route.** Không logic, không component JSX.
- **Next 16.** Dùng type Next sinh ra (`LayoutProps<"/">`), không tự viết props. Docs ở
  `node_modules/next/dist/docs/`.
- **`"use client"`** chỉ khi có state/effect/handler/browser API.
- **CSS-first.** Semantic token từ `app/globals.css` (`bg-primary`, `text-error`…), không
  `zinc-*` thô, không sửa `tailwind.config.ts` (v4 không load nó).
- **Mô tả test tiếng Việt.** `describe`/`it` mô tả hành vi bằng tiếng Việt; `describe` giữ tên
  component. Thuật ngữ kỹ thuật và tên prop giữ nguyên. Chi tiết: skill `shinkyu-testing`.

## File `.env*`

- Được sửa, nhưng **chỉ sau khi người dùng duyệt**. Trước khi sửa: nói file nào, key nào, thêm/đổi/xoá,
  và lý do. Không tự sửa để "cho chạy được".
- Không in giá trị secret ra chat/báo cáo — che bằng `***` (chỉ nêu tên key).
- Không commit `.env*` (đã gitignore). Thêm biến mới → ghi tên biến (không giá trị) vào
  README hoặc `.env.example` nếu có.
- Biến dùng ở client phải có tiền tố `NEXT_PUBLIC_`; secret thì không bao giờ có tiền tố đó.

Phần còn lại: `quality-gates.md`, `git-workflow.md`.
