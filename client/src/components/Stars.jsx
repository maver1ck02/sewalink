export default function Stars({ value }) {
  const n = Number(value) || 0;
  return <span aria-label={`${n} out of 5 stars`}>{'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))} {n.toFixed?.(1) || n}</span>;
}
