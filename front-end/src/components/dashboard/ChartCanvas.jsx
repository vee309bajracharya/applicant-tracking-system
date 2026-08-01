import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const ChartCanvas = ({ type, data, options, height = 220 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    chartRef.current = new Chart(canvasRef.current, {
      type,
      data,
      options: { responsive: true, maintainAspectRatio: false, ...options },
    });

    return () => chartRef.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, JSON.stringify(data), JSON.stringify(options)]);

  return (
    <div style={{ height }}>
      <canvas ref={canvasRef} role="img" aria-label={`${type} chart`} />
    </div>
  );
};

export default ChartCanvas;
