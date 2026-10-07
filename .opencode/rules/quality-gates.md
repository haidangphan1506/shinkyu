# shinkyu — quality gates

## Lệnh

```bash
npm run dev        # dev server (turbopack)
npm run lint       # eslint — phải pass
npm test           # jest, một lần
npm run test:watch # lặp nhanh
npm run test:ci    # --coverage, ngưỡng 70% — cổng thật sự
npm run build      # cần khi đổi route/layout/config/type
npx tsc --noEmit   # khi chủ yếu đang dời export
```

## Điều kiện xong việc

| Đã đổi                                    | Phải chạy               |
| ----------------------------------------- | ----------------------- |
| bất cứ thứ gì                             | `lint` + `test:ci`      |
| route, layout, metadata, config, type mới | thêm `build`            |
| barrel / import / export                  | thêm `npx tsc --noEmit` |

Không tin editor: kiểu do Next sinh ra chỉ lộ lúc build.

## Coverage

`test:ci` fail dưới 70% statements / branches / functions / lines. Muốn lấy lại coverage
thì **thêm test, không bao giờ hạ `coverageThreshold`**.

Hai méo làm số tệ hơn code thật — đừng đuổi theo:

- **File barrel** (`index.ts`) hiện 0% dưới v8 dù mọi leaf đã cover trọn.
- **Page trong `app/`** chưa cover và kéo trung bình xuống. Route là lớp bọc mỏng; test
  component là việc đáng giá hơn.

Lỗ hổng thật: leaf module có `Uncovered Line #s` dài — đọc từ output `test:ci`, không đoán.

Chi tiết cách viết test: skill `shinkyu-testing`.

## Mô tả test

`describe` và `it` viết mô tả tiếng Việt. `describe` giữ tên component (tên symbol trong
source), chỉ phần mô tả hành vi trong `it` là tiếng Việt. Không dịch thuật ngữ kỹ thuật và
tên prop. Khi sửa một test file, dịch luôn các mô tả còn tiếng Anh trong file đó.

`describe` ngoài cùng giữ tên symbol trong source. Bên trong phải gom test case theo **trạng
thái** bằng `describe` con tên tiếng Việt: loading và idle, rỗng và có dữ liệu, active và
không active, validate pass và fail. Tên nhóm nói ra trạng thái, không nói ra hành động.
Chi tiết: skill `shinkyu-testing`.

## Đừng làm để xanh

- Nới matcher, xoá test fail, hoặc hạ ngưỡng.
- Sửa component cho "hợp với test" trừ khi test đã mã hoá kỳ vọng sai — khi đó xác nhận ý định
  với component và type trước, rồi nói ra trong báo cáo.
- Thêm `data-testid` chỉ khi thật sự không có accessible name (tiền lệ: spinner). Nếu không
  tìm được element bằng role, đó là lỗ hổng accessibility — sửa component, không đổi query.
