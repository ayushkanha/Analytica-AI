import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import Plot from "react-plotly.js";

const initialLayout = [
  { i: "chart1", x: 0, y: 0, w: 6, h:20},
  { i: "chart2", x: 6, y: 0, w: 6, h:30 },
];

export default function Dashboard() {
  const [layout, setLayout] = useState(initialLayout);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    // TODO: send newLayout to FastAPI backend to persist in DB
    console.log("Updated layout:", newLayout);
  };

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={10}
      width={2000}
      onLayoutChange={handleLayoutChange}
      draggableHandle=".drag-handle"
    >
      <div key="chart1" className="p-2 bg-white rounded-xl shadow-md">
        <div className="drag-handle cursor-move font-bold">📊 Chart 1</div>
        <Plot
          data={[{ x: [1, 2, 3], y: [2, 6, 3], type: "bar" }]}
          layout={{ title: "Bar Chart", autosize: true }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <div key="chart2" className="p-2 bg-white rounded-xl shadow-md">
        <div className="drag-handle cursor-move font-bold">📈 Chart 2</div>
        <Plot
          data={[{ x: [1, 2, 3], y: [2, 5, 3], type: "line" }]}
          layout={{ title: "Line Chart", autosize: true }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </GridLayout>
  );
}
