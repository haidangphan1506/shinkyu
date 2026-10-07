import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableData } from '@/components/ui/table-data';
import type { TableColumn } from '@/types';

type Row = { id: number; name: string; score: number };

const columns: readonly TableColumn<Row>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
];

const data: readonly Row[] = [
  { id: 1, name: 'Alice', score: 10 },
  { id: 2, name: 'Bob', score: 20 },
];

function getBodyRows(): HTMLElement[] {
  const [, body] = screen.getAllByRole('rowgroup');
  return within(body).getAllByRole('row');
}

describe('TableData', () => {
  describe('có dữ liệu', () => {
    it('render header của các cột', () => {
      render(<TableData columns={columns} data={data} rowKey="id" />);
      expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    });

    it('render một row cho mỗi phần tử data', () => {
      render(<TableData columns={columns} data={data} rowKey="id" />);
      expect(getBodyRows()).toHaveLength(2);
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('lấy giá trị ô từ row[column.key] khi cột không có render', () => {
      render(<TableData columns={columns} data={data} rowKey="id" />);
      const [firstRow] = getBodyRows();
      const cells = within(firstRow).getAllByRole('cell');
      expect(cells[0]).toHaveTextContent('1');
      expect(cells[1]).toHaveTextContent('Alice');
    });

    it('dùng column.render khi cột có custom renderer', () => {
      const scoreColumn: readonly TableColumn<Row>[] = [
        {
          key: 'score',
          header: 'Score',
          render: (row, index) => `${row.score} điểm (dòng ${index})`,
        },
      ];
      render(<TableData columns={scoreColumn} data={data} rowKey="id" />);
      expect(screen.getByText('10 điểm (dòng 0)')).toBeInTheDocument();
      expect(screen.getByText('20 điểm (dòng 1)')).toBeInTheDocument();
    });

    it('gọi onRowClick với row và index tương ứng', async () => {
      const onRowClick = jest.fn();
      render(<TableData columns={columns} data={data} rowKey="id" onRowClick={onRowClick} />);
      await userEvent.click(screen.getByText('Bob'));
      expect(onRowClick).toHaveBeenCalledWith(data[1], 1);
    });

    it('gọi onRowClick đúng một lần cho mỗi lần click', async () => {
      const onRowClick = jest.fn();
      render(<TableData columns={columns} data={data} rowKey="id" onRowClick={onRowClick} />);
      await userEvent.click(screen.getByText('Alice'));
      expect(onRowClick).toHaveBeenCalledTimes(1);
    });

    it('thêm cursor-pointer cho row khi có onRowClick', () => {
      render(<TableData columns={columns} data={data} rowKey="id" onRowClick={jest.fn()} />);
      getBodyRows().forEach((row) => {
        expect(row).toHaveClass('cursor-pointer');
      });
    });

    it('không thêm cursor-pointer khi không có onRowClick', () => {
      render(<TableData columns={columns} data={data} rowKey="id" />);
      getBodyRows().forEach((row) => {
        expect(row).not.toHaveClass('cursor-pointer');
      });
    });

    it('nhận rowKey dạng hàm và truyền row cùng index', () => {
      const rowKey = jest.fn((row: Row, index: number) => `${row.name}-${index}`);
      render(<TableData columns={columns} data={data} rowKey={rowKey} />);
      expect(rowKey).toHaveBeenCalledWith(data[0], 0);
      expect(rowKey).toHaveBeenCalledWith(data[1], 1);
      expect(getBodyRows()).toHaveLength(2);
    });

    it('nối rowClassName dạng chuỗi vào mọi row', () => {
      render(<TableData columns={columns} data={data} rowKey="id" rowClassName="bg-muted" />);
      getBodyRows().forEach((row) => {
        expect(row).toHaveClass('bg-muted', 'transition-colors');
      });
    });

    it('dùng rowClassName dạng hàm để class khác nhau theo row', () => {
      render(
        <TableData
          columns={columns}
          data={data}
          rowKey="id"
          rowClassName={(row) => (row.id === 1 ? 'row-first' : 'row-other')}
        />,
      );
      const [firstRow, secondRow] = getBodyRows();
      expect(firstRow).toHaveClass('row-first');
      expect(secondRow).toHaveClass('row-other');
    });

    it('nối column.className vào ô và column.headerClassName vào header', () => {
      const styledColumns: readonly TableColumn<Row>[] = [
        { key: 'id', header: 'ID', headerClassName: 'w-20', className: 'font-mono' },
      ];
      render(<TableData columns={styledColumns} data={data} rowKey="id" />);
      expect(screen.getByRole('columnheader', { name: 'ID' })).toHaveClass('w-20');
      expect(within(getBodyRows()[0]).getByRole('cell')).toHaveClass('font-mono');
    });

    it.each([
      ['left', 'text-left'],
      ['center', 'text-center'],
      ['right', 'text-right'],
    ] as const)('căn cột theo align %s', (align, expected) => {
      const alignedColumns: readonly TableColumn<Row>[] = [{ key: 'name', header: 'Name', align }];
      render(<TableData columns={alignedColumns} data={data} rowKey="id" />);
      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass(expected);
      expect(within(getBodyRows()[0]).getByRole('cell')).toHaveClass(expected);
    });

    it('mặc định căn trái khi cột không khai báo align', () => {
      render(<TableData columns={columns} data={data} rowKey="id" />);
      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass('text-left');
      expect(within(getBodyRows()[0]).getAllByRole('cell')[1]).toHaveClass('text-left');
    });

    it('nối className vào wrapper và tableClassName vào phần tử table', () => {
      const { container } = render(
        <TableData
          columns={columns}
          data={data}
          rowKey="id"
          className="mt-4"
          tableClassName="table-fixed"
        />,
      );
      expect(container.firstElementChild).toHaveClass('mt-4', 'overflow-x-auto');
      expect(screen.getByRole('table')).toHaveClass('table-fixed', 'w-full');
    });

    it('bỏ qua className rỗng mà không để lại khoảng trắng thừa', () => {
      const { container } = render(
        <TableData columns={columns} data={data} rowKey="id" className="" tableClassName="" />,
      );
      const wrapper = container.firstElementChild as HTMLElement;
      const table = screen.getByRole('table');
      expect(wrapper.className).toBe(wrapper.className.trim());
      expect(wrapper.className).not.toMatch(/\s{2,}/);
      expect(table.className).not.toMatch(/\s{2,}/);
    });

    it('render header ReactNode tùy ý', () => {
      const richColumns: readonly TableColumn<Row>[] = [
        { key: 'id', header: <span>ID đánh số</span> },
      ];
      render(<TableData columns={richColumns} data={data} rowKey="id" />);
      expect(screen.getByRole('columnheader', { name: 'ID đánh số' })).toBeInTheDocument();
    });
  });

  describe('giới hạn bề rộng cột', () => {
    it('áp maxWidth từ column.width lên ô và header', () => {
      const wideColumns: readonly TableColumn<Row>[] = [{ key: 'id', header: 'ID', width: 80 }];
      render(<TableData columns={wideColumns} data={data} rowKey="id" />);
      expect(screen.getByRole('columnheader', { name: 'ID' })).toHaveStyle('max-width: 80px');
      expect(within(getBodyRows()[0]).getByRole('cell')).toHaveStyle('max-width: 80px');
    });

    it('dùng maxWidth mặc định khi cột không khai width', () => {
      render(<TableData columns={columns} data={data} rowKey="id" />);
      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveStyle('max-width: 320px');
      expect(within(getBodyRows()[0]).getAllByRole('cell')[1]).toHaveStyle('max-width: 320px');
    });
  });

  describe('cột ghim fixed', () => {
    const fixedColumns: readonly TableColumn<Row>[] = [
      { key: 'id', header: 'ID', width: 100, fixed: true },
      { key: 'name', header: 'Name', width: 150, fixed: true },
      { key: 'score', header: 'Score', width: 80 },
    ];

    it('gắn class sticky và z-index cho cột fixed', () => {
      render(<TableData columns={fixedColumns} data={data} rowKey="id" />);
      expect(screen.getByRole('columnheader', { name: 'ID' })).toHaveClass('sticky', 'z-20');
      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass('sticky', 'z-20');
      const cells = within(getBodyRows()[0]).getAllByRole('cell');
      expect(cells[0]).toHaveClass('sticky', 'z-10');
      expect(cells[1]).toHaveClass('sticky', 'z-10');
    });

    it('không gắn sticky cho cột thường', () => {
      render(<TableData columns={fixedColumns} data={data} rowKey="id" />);
      expect(screen.getByRole('columnheader', { name: 'Score' })).not.toHaveClass('sticky');
      expect(within(getBodyRows()[0]).getAllByRole('cell')[2]).not.toHaveClass('sticky');
    });

    it('dịch cột fixed sang phải theo chiều rộng tích lũy', () => {
      render(<TableData columns={fixedColumns} data={data} rowKey="id" />);
      expect(screen.getByRole('columnheader', { name: 'ID' })).toHaveStyle({ left: '0px' });
      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveStyle({ left: '100px' });
      const cells = within(getBodyRows()[0]).getAllByRole('cell');
      expect(cells[1]).toHaveStyle({ left: '100px' });
    });

    it('nền header ghim che nội dung khi cuộn ngang', () => {
      render(<TableData columns={fixedColumns} data={data} rowKey="id" />);
      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass('bg-surface-muted');
    });

    it('dùng maxWidth mặc định cho cột fixed không khai width', () => {
      const noWidthColumns: readonly TableColumn<Row>[] = [
        { key: 'id', header: 'ID', fixed: true },
        { key: 'name', header: 'Name', width: 150, fixed: true },
      ];
      render(<TableData columns={noWidthColumns} data={data} rowKey="id" />);

      expect(screen.getByRole('columnheader', { name: 'ID' })).toHaveStyle('max-width: 320px');
      const cells = within(getBodyRows()[0]).getAllByRole('cell');
      expect(cells[0]).toHaveStyle('max-width: 320px');
      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveStyle({ left: '320px' });
      expect(cells[1]).toHaveStyle({ left: '320px' });
    });
  });

  describe('data rỗng', () => {
    it('hiện chữ empty do người dùng truyền khi data rỗng', () => {
      render(<TableData columns={columns} data={[]} rowKey="id" emptyText="Nothing here" />);
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('mặc định hiện chữ ユーザーが見つかりません khi data rỗng và không truyền emptyText', () => {
      render(<TableData columns={columns} data={[]} rowKey="id" />);
      expect(screen.getByText('ユーザーが見つかりません')).toBeInTheDocument();
    });

    it('cho ô rỗng chiếm hết số cột', () => {
      render(<TableData columns={columns} data={[]} rowKey="id" />);
      const [, body] = screen.getAllByRole('rowgroup');
      const cell = within(body).getAllByRole('cell')[0];
      expect(cell).toHaveAttribute('colSpan', '2');
    });

    it('giữ cấu trúc bảng khi data rỗng: một row duy nhất trong tbody', () => {
      render(<TableData columns={columns} data={[]} rowKey="id" />);
      expect(getBodyRows()).toHaveLength(1);
    });
  });

  describe('loading', () => {
    it('hiện chỉ báo loading và ẩn chữ empty trong lúc loading', () => {
      render(
        <TableData columns={columns} data={[]} rowKey="id" loading emptyText="Nothing here" />,
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByText('Nothing here')).not.toBeInTheDocument();
    });

    it('đánh dấu vùng loading là polite live region kèm nhãn ẩn', () => {
      render(<TableData columns={columns} data={[]} rowKey="id" loading />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(within(status).getByText('Loading')).toBeInTheDocument();
    });

    it('không hiện chỉ báo loading khi không truyền loading', () => {
      render(<TableData columns={columns} data={data} rowKey="id" />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
