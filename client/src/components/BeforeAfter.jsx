export default function BeforeAfter({ before, after }) {
  if (!before && !after) return null;
  return (
    <div className="ba">
      <figure>
        <img src={before || after} alt="Before work" />
        <figcaption>Before</figcaption>
      </figure>
      <figure>
        <img src={after || before} alt="After work" />
        <figcaption>After</figcaption>
      </figure>
    </div>
  );
}
