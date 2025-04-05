import * as React from "react";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 text-center">
      <h3>Counter: {count}</h3>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setCount((prev) => prev - 1)}
          className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Decrease
        </button>
        <button
          onClick={() => setCount((prev) => prev + 1)}
          className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Increase
        </button>
      </div>
    </div>
  );
}
