---
name: shinkyu-next
description: Quy tắc Next.js 16 App Router của dự án shinkyu — file route và layout, metadata, async params, Turbopack, và kiểu props do Next sinh ra. Dùng skill này bất cứ khi task chạm vào app/, một route, một layout, metadata, next.config.ts, hoặc bất cứ thứ gì thuần Next. Cũng dùng khi một component cần biết mình là server hay client trong cây route của app này, hoặc khi lỗi build nhắc tới LayoutProps, PageProps, hay một file convention. Hãy dùng trước khi viết bất kỳ API call Next.js nào, vì Next 16 phá vỡ nhiều quy ước mà kiến thức huấn luyện của bạn cho là đúng.
---

# shinkyu — Next.js 16 App Router

Shinkyu chạy **Next 16.3.6** với App Router và Turbopack. Next 16 có breaking change so với
điều phần lớn kiến thức mô hình đang giả định. Hãy kiểm chứng trước khi khẳng định.

## Đọc tài liệu đi kèm trước khi viết code Next

Cây source của Next.js đóng gói sẵn tài liệu của chính nó nằm trong repo này. Resolve từ
repo root:

```
node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/   # layout, page, route, template
node_modules/next/dist/docs/01-app/03-api-reference/04-functions/           # tra cứu từng function
node_modules/next/dist/docs/01-app/03-api-reference/05-config/              # next.config.ts
node_modules/next/dist/docs/01-app/03-api-reference/08-turbopack/           # hành vi bundler
node_modules/next/dist/docs/01-app/02-guides/                               # migration + pattern
```

Đọc guide liên quan trước khi viết một file convention mới hoặc gọi một function bạn chưa từng
dùng trong repo này. Suy đoán từ trí nhớ chính là điểm yếu repo này phải đối mặt.

## Kiểu props do Next sinh ra, không tự viết tay

Layout và page trong repo này nhận props từ các kiểu Next sinh ra ở `.next/types` — **không**
tự khai báo `{ children }: { children: React.ReactNode }`.

```tsx
// app/(root)/layout.tsx — pattern để copy
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout';

export const metadata: Metadata = {
  title: { default: 'Shinkyu', template: '%s | Shinkyu' },
  description: 'Manage your Shinkyu workspace.',
};

const AuthenticatedLayout = ({ children }: LayoutProps<'/'>) => <AppShell>{children}</AppShell>;

export default AuthenticatedLayout;
```

`LayoutProps` / `PageProps` là global ambient — không cần import, và khóa path segment
(`"/"`) cho Next biết props thuộc route nào trong cây. Khi bạn thêm route hoặc dynamic
segment, hãy chạy build hoặc `next dev` để kiểu được sinh ra; lỗi "thiếu khóa
`LayoutProps`" hầu như luôn nghĩa là route mới và kiểu chưa được sinh lại, chứ không phải
kiểu sai.

## app/ là route và không gì hơn

`app/` giữ route file, layout, và export `metadata`. Không business logic, không component
JSX, không danh sách option, không validate. Nếu route cần nội dung hiển thị, nó ghép lại
thứ gì đó từ `components/`.

```
app/(auth)/layout.tsx        shell chưa đăng nhập
app/(root)/layout.tsx        shell đã đăng nhập (bọc children trong AppShell)
app/(root)/members/…         các route tính năng lồng nhau
```

Route group `(auth)` và `(root)` tổ chức lồng nhau layout mà không ảnh hưởng URL. Giữ page
mới ở đúng group để nó thừa hưởng đúng lớp chrome.

## Mặc định là server, client chỉ khi cần

Route file và layout giữ nguyên là server component trừ khi thực sự cần state, effect, event
handler, hoặc browser API. Thêm `"use client"` vào một page sẽ kéo client JS tới một route
không cần nó. Code tương tác thuộc về `components/`, page chỉ render nó.

## Turbopack là bundler mặc định

`npm run dev` và `next build` dùng Turbopack ở đây. Đừng với tới escape hatch riêng cho
webpack trừ khi một guide đi kèm nói bản tương đương trên Turbopack không tồn tại.

## Block trong AGENTS.md do máy sinh

`AGENTS.md` chứa block `<!-- BEGIN:nextjs-agent-rules -->` mà `next dev` ghi ra và thêm lại.
Kiểm chứng bộ sinh tại `node_modules/next/dist/server/lib/generate-agent-files.js`. Không bao
giờ tự sửa block đó, và không bao giờ gỡ nó khỏi diff — gỡ đi chỉ làm thay đổi chưa commit tái
hiện lại. Hãy commit nó kèm công việc của bạn để cây làm việc sạch.

## Kiểm chứng

`npm run lint`, rồi `npm run build` khi bạn đổi route, layout, metadata, hay config. Lỗi type
lộ ra lúc build ở đây nhờ các kiểu được sinh ra, nên đừng chỉ dựa vào editor.
