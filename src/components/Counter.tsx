import * as React from "react";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h3>Counter: {count}</h3>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button
          onClick={() => setCount((prev) => prev - 1)}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Decrease
        </button>
        <button
          onClick={() => setCount((prev) => prev + 1)}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Increase
        </button>
      </div>
    </div>
  );
}
