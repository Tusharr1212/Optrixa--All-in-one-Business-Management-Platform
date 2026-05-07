interface Props {
  rows?: number;
  cols?: number;
}

const TableSkeleton = ({ rows = 5, cols = 5 }: Props) => {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i}>
          {[...Array(cols)].map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div
                className="h-4 bg-gray-100 rounded animate-pulse"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;