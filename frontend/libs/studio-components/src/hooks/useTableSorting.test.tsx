import { useTableSorting } from './useTableSorting';
import { renderHook, waitFor } from '@testing-library/react';
import type { Rows } from '../components';

describe('useTableSorting', () => {
  const rows: Rows = [
    {
      id: 1,
      name: 'A form',
      creator: 'Digdir',
    },
    {
      id: 2,
      name: 'B form',
      creator: 'Brreg',
    },
    {
      id: 3,
      name: 'C form',
      creator: 'Skatt',
    },
  ];

  it('should render the initial state', () => {
    const { result } = renderHook(() => useTableSorting(rows, { enable: true }));
    expect(result.current.sortedRows).toEqual(rows);
  });

  it('should sort rows in ascending order when a column is clicked', async () => {
    const { result } = renderHook(() => useTableSorting(rows, { enable: true }));
    await waitFor(() => result.current.handleSorting('creator'));

    const creatorsAscending: string[] = [];
    result.current.sortedRows.forEach((row) => {
      creatorsAscending.push(String(row.creator));
    });

    expect(creatorsAscending[0]).toEqual('Brreg');
    expect(creatorsAscending[1]).toEqual('Digdir');
    expect(creatorsAscending[2]).toEqual('Skatt');
  });

  it('should sort rows in descending order when the same column is clicked again', async () => {
    const { result } = renderHook(() => useTableSorting(rows, { enable: true }));
    await waitFor(() => result.current.handleSorting('creator'));
    await waitFor(() => result.current.handleSorting('creator'));

    const creatorsDescending: string[] = [];
    result.current.sortedRows.forEach((row) => {
      creatorsDescending.push(String(row.creator));
    });

    expect(creatorsDescending[0]).toEqual('Skatt');
    expect(creatorsDescending[1]).toEqual('Digdir');
    expect(creatorsDescending[2]).toEqual('Brreg');
  });

  it('should reset the sort direction to ascending when a different column is clicked', async () => {
    const { result } = renderHook(() => useTableSorting(rows, { enable: true }));
    await waitFor(() => result.current.handleSorting('creator'));
    await waitFor(() => result.current.handleSorting('id'));
    expect(result.current.sortedRows).toEqual(rows);
  });

  it("should make 'sortedRows' and 'handleSorting' undefined when enable is false", () => {
    const { result } = renderHook(() => useTableSorting(rows, { enable: false }));
    expect(result.current.sortedRows).toBeUndefined();
    expect(result.current.handleSorting).toBeUndefined();
  });
});
