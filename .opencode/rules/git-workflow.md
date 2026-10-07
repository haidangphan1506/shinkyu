# shinkyu — git workflow

## Phân quyền agent

Subagent (`shinkyu-dev`, `shinkyu-test`, `shinkyu-review`, `shinkyu-research`) **không** được `git add`,
`git commit`, `git push`. Chúng báo cáo thay đổi; người dùng quyết định commit.
Nếu cần commit → dừng lại và hỏi.

Lệnh đọc (`status`, `diff`, `log`, `show`) được allow.

## Trước khi báo xong

```bash
npm run lint && npm run test:ci && git status --short
```

Cả ba đều nhanh. `test:ci` là cổng thật sự — xem `quality-gates.md`.

## Nhiễu git đã biết

Hai thứ này luôn hiện trong `git status` và **không phải lỗi**:

| Thứ                                                 | Nguyên nhân                                                                                | Xử lý          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------- |
| `coverage/` untracked                               | `jest --coverage` sinh ra, đã gitignore                                                    | không commit   |
| block `nextjs-agent-rules` trong `AGENTS.md` bị sửa | `next dev` viết lại (bộ sinh: `node_modules/next/dist/server/lib/generate-agent-files.js`) | **commit kèm** |

Không bao giờ gỡ block đó khỏi diff để "dọn cho gọn" — `next dev` sẽ viết lại y hệt, tạo
thay đổi chưa commit vĩnh viễn.

## Commit

- Một commit = một thay đổi có thể mô tả bằng một động từ. Không trộn refactor với feature.
- Conventional Commits: `feat|fix|refactor|test|docs|chore`.
- Body giải thích **tại sao**, không lặp lại diff.
- Không commit secret, `.env*` (đã gitignore ở repo này).
- Không `--force`, không `--amend` một commit đã chia sẻ, không sửa git config.

## Trước khi nhờ review

`git diff` đọc lại một lượt — phần lớn finding review là thứ tác giả đã thấy nếu tự đọc diff.
Phạm vi review: subagent `shinkyu-review`.

## Nhiễu khi review

Bỏ qua `coverage/` và block `AGENTS.md`. Chỉ nêu block đó nếu ai đó định gỡ nó.
