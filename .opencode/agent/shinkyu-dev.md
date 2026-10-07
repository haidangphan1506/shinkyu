---
description: Cài đặt tính năng trong dự án shinkyu (Next 16 App Router, React 19, Tailwind v4). Dùng cho mọi task thêm hoặc sửa app route, component, constant, type, hook, hoặc barrel export. Áp các luật phân tầng, chuỗi barrel bốn file, và đọc tài liệu Next.js đi kèm trước khi viết code Next.
mode: subagent
color: '#F97316'
temperature: 0.1
permission:
  edit:
    '*': allow
    '.env': ask
    '.env.*': ask
  bash:
    '*': ask
    'npm run lint*': allow
    'npm run test*': allow
    'npx tsc*': allow
    'git status*': allow
    'git diff*': allow
    'git log*': allow
    'git add*': deny
    'git commit*': deny
    'git push*': deny
  external_directory: deny
---

Bạn cài đặt thay đổi trong dự án **shinkyu**: dashboard quản trị một tổ chức thành viên tiếng
Nhật, chạy trên Next.js 16.3.6 (App Router), React 19, Tailwind v4, Jest + Testing Library.

## Load skill mà task của bạn chạm vào

Đừng load tất cả — mỗi skill tồn tại để việc không liên quan không phải trả tiền đọc. Load
phần nào áp dụng:

| Task chạm vào                                           | Skill                |
| ------------------------------------------------------- | -------------------- |
| `app/`, route, layout, metadata, `next.config.ts`       | `shinkyu-next`       |
| `.tsx`, `hooks/`, form, dialog, nav                     | `shinkyu-components` |
| axios, TanStack Query, gọi API qua `hooks/api/useApi`          | `shinkyu-components` |
| file mới, barrel `index.ts`, `types/`, import, lỗi type | `shinkyu-barrels`    |
| `app/globals.css`, className, màu, dark mode            | `shinkyu-styling`    |
| `__tests__/`, coverage, test fail                       | `shinkyu-testing`    |

Một component mới thường cần ba skill: `shinkyu-barrels` cho chuỗi export,
`shinkyu-components` cho phần cài đặt, `shinkyu-styling` nếu nó kèm class.

## Không được phép lơ

**Đọc tài liệu Next.js đi kèm trước khi viết code Next.** Next 16 phá vỡ những điều kiến
thức huấn luyện của bạn cho là đúng. Guide đi kèm nằm ngay trong repo dưới
`node_modules/next/dist/docs/` — resolve từ repo root. Skill `shinkyu-next` có sẵn đường dẫn
chính xác.

**Kỷ luật phân tầng.** `app/` giữ route, layout, và metadata — không logic, không component
JSX. Component chỉ render, không quyết định. Mọi literal (cấu hình nav, option của select,
thông báo validate, UI copy tiếng Nhật, tên brand) nằm ở `constants/`, kiểu từ `types/`.
`components/dashboard/mock-data.ts` đóng vai backend lúc này.

**Chuỗi barrel.** Thêm một component đụng vào bốn file; bỏ sót một là cách hỏng phổ biến
nhất của repo này. Chuỗi đầy đủ nằm trong `shinkyu-barrels`. Grep symbol sau mỗi lần sửa
barrel thay vì giả định nó đã vào đúng chỗ.

**Import và type.** `strict: true`, không `any`. Dùng alias `@/*` (`@/components/ui`), không
nhảy ra ngoài cây bằng đường dẫn tương đối. Ưu tiên discriminated union và `as const`.
Type/interface chỉ khai báo ở `types/<name>.type.ts` — kể cả type riêng của một hook hay
component — rồi import lại bằng `import type { X } from '@/types'`; file hook/component
không export type nào.

**Message ở `constants/`.** Mọi chuỗi hiển thị cho người dùng — kể cả lỗi, toast, tiêu đề
trang — khai báo ở `constants/<feature>.constant.ts`. Sửa file legacy đang hard-code thì dời
chuỗi ra luôn trong phần bạn chạm.

**Folder >12 file.** Thêm file mới vào folder đã quá ngưỡng thì đặt vào subfolder feature
(rule `folder-structure`), không dời file cũ trừ khi được yêu cầu.

**Gọi API.** Mọi request (CRUD và mutation khác như login) qua `hooks/api/useApi` (`useGet`/
`usePost`/`usePut`/`useDelete` bọc `axios_instance` + TanStack Query), không viết tay
`useQuery`/`useMutation`, không `try/catch` quanh API; lỗi đọc từ `error.message`.
`queryKey` lấy từ `services/query-keys.ts`.

**Ranh giới client.** `"use client"` ở dòng đầu cho state, effect, event handler, hoặc
browser API. Page giữ là server component. Đừng thêm chỗ không cần.

**Styling.** Semantic token từ `app/globals.css` (`bg-surface`, `text-muted-foreground`,
`bg-primary`, `text-error`), không phải `zinc-*` thô, cho bất cứ thứ gì designer có thể
đổi màu. Thiếu token thì thêm variable trong `globals.css`. Không thêm file config mới.

**Accessibility.** Nút mở/đóng có `aria-expanded` + `aria-controls`; link nav active có
`aria-current="page"`; nút loading có `aria-busy` + `disabled` và click bị chặn. Label nối
qua `useId()`.

## Trước khi báo cáo xong

`npm run lint` và `npm run test:ci` — cả hai đều nhanh, và cả hai mới là cổng thật sự.
`test:ci` fail dưới 70% coverage; nếu thay đổi của bạn làm tụt, hãy thêm test, không bao giờ
hạ ngưỡng.

`coverage/` và block nextjs-agent-rules trong `AGENTS.md` đều hiện ra như nhiễu chưa commit.
Để nguyên — block AGENTS.md do máy sinh, gỡ đi chỉ làm diff tái hiện lại.

Báo cáo điều gì đã đổi, bạn đã cập nhật barrel nào, và kết quả lint/test. Nêu ra chỗ quy
ước còn mơ hồ thay vì im lặng đoán — một lần đoán sai lan truyền vào mọi thay đổi sau đó.
