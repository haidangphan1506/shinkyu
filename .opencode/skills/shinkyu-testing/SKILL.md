---
name: shinkyu-testing
description: Quy ước test của dự án shinkyu — thiết lập Jest 30 và Testing Library, bố cục thư mục __tests__ soi chiếu với source, mô tả describe/it bằng tiếng Việt, query theo role, userEvent cho tương tác, và cách đọc báo cáo coverage. Dùng skill này bất cứ khi task viết hoặc sửa một test, thêm component cần test coverage, điều tra một test fail, hoặc hỏi tại sao coverage thấp hơn ngưỡng hay trông sai dù một tính năng đã được test tốt.
---

# shinkyu — testing

Jest 30, `@testing-library/react`, `@testing-library/user-event`, môi trường jsdom, coverage
provider là v8. Config ở `jest.config.ts` (bọc `next/jest`) và `jest.setup.ts` (import
`@testing-library/jest-dom` cộng một chặn navigation của jsdom, xem dưới).

## Lệnh

```bash
npm test           # chạy đầy đủ một lần
npm run test:watch # watch mode khi lặp nhanh
npm run test:ci    # --coverage, áp ngưỡng 70% toàn cục — cổng thật sự
npm run lint
```

Lặp với `test:watch`, nhưng luôn kết thúc bằng `test:ci`, vì chỉ lệnh đó mới áp ngưỡng.
`test:ci` trả về exit code khác 0 khi dưới 70% statements, branches, functions, hoặc lines.

## Bố cục

`__tests__/` soi chiếu chính xác cây source:

```
components/ui/button.tsx            → __tests__/components/ui/button.test.tsx
components/layout/sidebar/sidebar-item.tsx → __tests__/components/layout/sidebar/sidebar-item.test.tsx
```

Giữ đúng phép soi chiếu này. Một test đặt lệch chỗ là một test không ai tìm lại được.

## Tách trạng thái bằng describe lồng

`describe` ngoài cùng giữ tên symbol trong source. Bên trong, gom test case theo **trạng
thái** bằng `describe` con tên tiếng Việt chữ thường — loading và idle, rỗng và có dữ liệu,
active và không active, validate pass và fail. Đừng để 25 test nằm phẳng trong một describe
rồi tự tìm nhánh nào thuộc trạng thái nào.

```tsx
describe('TableData', () => {
  describe('có dữ liệu', () => {});
  describe('data rỗng', () => {});
  describe('loading', () => {});
});
```

Tên nhóm nói ra **trạng thái**, không phải loại hành động. `describe("gọi API")` là nhóm
sai; `describe("loading")`, `describe("tải xong")` là nhóm đúng. Khi gom, `it` giữ nguyên
tên và assertion — chỉ dời chỗ và thụt lề.

## Mô tả test bằng tiếng Việt

`describe`, `it`, và `test` viết mô tả tiếng Việt — đây là quy tắc, không phải tuỳ chọn.
Mọi file trong `__tests__/` đã theo; giữ nguyên khi sửa test cũ.

```tsx
describe('CreateMemberDialog', () => {
  it('render mọi field kèm label', () => {});
  it('hiển thị lỗi required và không submit form rỗng', async () => {});
  it('từ chối email sai định dạng', async () => {});
});
```

`describe` giữ tên component — tên đó là tên symbol trong source, không dịch. Chỉ phần mô tả hành
vi trong `it` là tiếng Việt.

- Văn phạm: bắt đầu bằng động từ (`render`, `hiển thị`, `gọi`, `không gọi`, `disable`, `xoá`),
  rồi tới điều kiện. Đọc tên test phải hiểu được component phải làm gì mà không cần mở file.
- Không dịch thuật ngữ kỹ thuật và động từ quen dùng trong repo: `render`, `toggle`,
  `reset`, `resolve`, `fallback`, `disabled`, `loading`, `spinner`, `submit`, `field`,
  `form`, `focus`, `overlay`, `label`, `error`, `empty`, `aria-*`, tên prop, tên event. Dịch
  văn phạm, giữ tên.
- Assert trong thân `it` không đổi — chỉ chuỗi mô tả là tiếng Việt.
- Test cũ viết tiếng Anh thì dịch luôn khi đang sửa file đó; không để một file lẫn hai thứ tiếng.

## Cách viết test

Query theo role và accessible name:

```tsx
render(<Button onClick={onClick}>Save</Button>);
await userEvent.click(screen.getByRole('button', { name: 'Save' }));
```

Ưu tiên cách này hơn `data-testid`. Nếu không tìm được một element bằng role, đó thường là
lỗ hổng accessibility thật trong component — hãy sửa ở đó. `getByTestId` duy nhất trong suite
(`button-spinner`) là hợp lý vì spinner thực sự không có accessible name; giữ các test mới ở
mức tiêu chuẩn đó.

Tương tác là bất đồng bộ. `await userEvent.click(...)` — một click không await sẽ giấu bug
timing lộ ra trong production.

Assert chính xác. `expect(onClick).toHaveBeenCalledTimes(1)` bắt được hiện tượng gọi hai
lần; `toHaveBeenCalled()` thì không.

Phủ các nhánh có thật trong code: loading và idle, rỗng và có dữ liệu, nav item active và
không active, validate pass và fail. Đọc cột `Uncovered Line #s` trong bảng coverage trước khi
kết luận một file đã được test tốt.

`button.test.tsx` là hình mẫu để copy — render children, bắn onClick, tôn trọng `disabled`,
hiện spinner và chặn click khi loading, không spinner khi idle.

## jsdom không có navigation

Click vào `<a href="/...">` làm jsdom log `Not implemented: navigation (except hash changes)`
qua `console.error`. Warning này **flaky** — `HTMLHyperlinkElementUtils` hẹn `setTimeout`
nên có lúc hiện, có lúc không; đừng tưởng test sạch là đã hết lỗi.

`jest.setup.ts` đã chặn default của mọi click lên anchor có `href` không bắt đầu bằng `#`.
jsdom chỉ chạy activation behavior khi `defaultPrevented` là false
(`EventTarget-impl.js:251`), nên chặn ở đây là đúng chỗ. Hash vẫn đi qua vì jsdom hỗ trợ hash.

Đừng thêm `console.error` spy vào test chỉ để dập warning này — fix đã ở setup rồi. Đừng xoá
anchor hay đổi thành `<div>` để né: `href` là một phần hành vi cần test.

## Đọc coverage mà không đuổi theo cái bóng

Hai méo đã biết làm số điện thấp hơn code thực tế:

**File barrel bị tính là chưa cover.** Dưới v8 provider, file re-export `index.ts` hiện 0%
dù mọi leaf module nó re-export đã được cover trọn — module có load, nhưng các dòng re-export
bản thân chúng không bao giờ chạy. Một thư mục gần 0% trong khi leaf có coverage cao là
trường hợp này, không phải thiếu test. `collectCoverageFrom` trong `jest.config.ts` có
chúng; báo cáo trong `coverage/` đã bị gitignore.

**Page trong `app/` chưa được test.** Mọi route file hiện 0% và kéo trung bình toàn cục xuống.
Route là lớp bọc mỏng render một component; test component là việc đáng giá hơn, và thêm
test cho route là tuỳ chọn.

Số coverage thay đổi theo từng commit — chạy `npm run test:ci` để lấy số thật, đừng tin số
ghi trong tài liệu. Lỗ hổng thật là leaf module (component, hook, util, service) có
`Uncovered Line #s` dài, không phải barrel hay page.

## Những luật quan trọng

- Sửa test, không sửa assertion. Nếu một test mã hoá kỳ vọng sai — hành vi đã đổi có chủ ý —
  hãy xác nhận ý định với component và type của nó trước khi viết lại, và nói ra điều đó.
- Không bao giờ nới matcher để lên xanh. Không bao giờ xoá một test fail.
- Không bao giờ hạ `coverageThreshold` cho một lần chạy xanh. Hãy thêm test.

## Accessibility cũng là một dạng test

`aria-expanded`, `aria-current="page"`, và `aria-busy` đều assert được qua `getByRole` và
`toHaveAttribute`. Thiếu thuộc tính nên làm test fail — đó là suite đang làm việc, không phải
chống lại bạn.
