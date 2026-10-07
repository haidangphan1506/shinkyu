---
name: shinkyu-styling
description: Quy ước Tailwind v4 và CSS của dự án shinkyu — theme token định nghĩa theo hướng CSS-first trong app/globals.css, khi nào dùng semantic utility thay vì màu palette thô, dark mode, và vì sao không thêm file CSS config mới. Dùng skill này bất cứ khi task chạm vào app/globals.css, chuỗi className, màu sắc, spacing, hoặc styling thị giác của bất kỳ component nào, hay khi câu hỏi review về màu hard-code hoặc thiếu design token. Cũng dùng khi một utility class không tồn tại và bạn đang phân vân có nên thêm file config.
---

# shinkyu — styling

Tailwind v4, cấu hình theo hướng **CSS-first**. `tailwind.config.ts` có trong repo nhưng v4
không load nó (`globals.css` không có `@config`) — file chết, đừng sửa nó để thêm token, và
đừng thêm file config khác. Theme token là CSS variable định nghĩa trong `app/globals.css` rồi map vào
Tailwind qua `@theme inline`.

## Token được định nghĩa thế nào

```css
/* app/globals.css */
@import 'tailwindcss';

:root {
  --surface: #ffffff;
  --surface-muted: #f4f4f5;
  --primary: #f97316;
  --primary-foreground: #ffffff;
  --muted-foreground: #71717a;
  --error: #dc2626;
  /* …cùng border, input, ring, success, warning, và dải brand-50…950 */
}

@theme inline {
  --color-surface: var(--surface);
  --color-primary: var(--primary);
  /* …mỗi token map sang tên --color-* của nó */
}
```

Chính phần map đó sinh ra các utility. `--color-primary` trở thành `bg-primary`,
`text-primary`, `border-primary`. Dùng tên semantic trong component.

## Token semantic, không dùng palette thô

```
bg-surface          text-foreground        bg-surface-muted
text-muted-foreground                       border-border
bg-primary          text-primary-foreground
bg-error            text-error-foreground
bg-success / bg-warning / bg-note         (+ -foreground)
bg-brand-500 … bg-brand-950                (dải cam)
```

Hãy với các tên này thay vì `zinc-*` hay bất kỳ giá trị palette thô nào trong component. Class
palette thô hard-code một quyết định thuộc về designer — đổi theme sau đó đòi sửa mọi
component thay vì một biến. Palette thô chấp nhận được cho bề mặt phụ trong một component
cụ thể khi chưa có token semantic, nhưng hãy tới token trước và cân nhắc thêm một token.

Codebase có dùng `dark:` với `zinc-*` ở vài component (`sidebar-item.tsx`). Hãy theo file
đang làm khi mở rộng một pattern sẵn có, nhưng ưu tiên token khi thêm cái mới.

## Thiếu token

Thêm biến trong `app/globals.css` — một custom property ở `:root` cộng một dòng
`--color-*` trong `@theme inline`. Đừng thêm file config, đừng nhúng hex tùy ý vào component,
đừng dùng cú pháp arbitrary value của Tailwind làm lối tắt. Arbitrary value kiểu
`text-[11px]` có trong codebase cho kích thước một-lần, thế là ổn; màu sắc _arbitrary_ mới
là thứ cần tránh.

## Dark mode

Dùng variant `dark:`, điều khiển bởi khai báo `color-scheme: light` ở đầu
`app/globals.css`. Component nằm trên một bề mặt thì dùng class cặp:

```tsx
className = 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300';
```

Ghép cặp có chủ đích — một class `dark:` mà không có đôi ở light thường nghĩa là trạng thái
light đã bị bỏ mặc làm mặc định thay vì được chọn có chủ ý.

## Ghép class

Có `cn()` ở `utils/cn.ts` (`clsx` + `tailwind-merge`) — dùng khi ghép `className` của caller
vào class mặc định để class sau ghi đè đúng (`range-date-picker.tsx`, `toaster.tsx`). Phần lớn
component cũ dựng chuỗi bằng template + ternary (`rowClassName` trong `sidebar-item.tsx`);
theo file đang sửa, không refactor hàng loạt. Không có `cva` — đừng thêm.

Các primitive ở `components/ui/*` nhận prop `className` và ghép vào, nên caller có thể chỉnh
spacing hoặc độ rộng mà không cần primitive mọc thêm variant.

## Kiểm chứng

`npm run lint`. Thay đổi thị giác cần `npm run dev` rồi nhìn — tên token trong `@theme inline`
chỉ tồn tại dưới dạng utility nếu có dòng map tương ứng, nên một class trông đúng mà
render ra không style thường là thiếu mapping chứ không phải gõ sai.
