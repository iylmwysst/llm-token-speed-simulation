type Props = {
  samples: number[];
  width?: number;
  height?: number;
};

export function Sparkline({ samples, width = 80, height = 20 }: Props) {
  if (samples.length < 2) {
    return <svg width={width} height={height} aria-hidden />;
  }

  const max = Math.max(...samples, 1);
  const min = 0;
  const stepX = width / (samples.length - 1);
  const points = samples
    .map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / (max - min)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.6}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
