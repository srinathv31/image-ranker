import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function Counter() {
  const [count, setCount] = useState(0);

  function handleIncrease() {
    setCount((prev) => prev + 1);
    toast.success("Count increased");
  }

  function handleDecrease() {
    setCount((prev) => prev - 1);
    toast.error("Count decreased");
  }

  return (
    <div className="p-4 text-center">
      <h3>Counter: {count}</h3>
      <div className="flex gap-2 justify-center">
        <Button
          className="cursor-pointer"
          onClick={handleDecrease}
          variant="destructive"
        >
          Decrease
        </Button>
        <Button
          className="cursor-pointer"
          onClick={handleIncrease}
          variant="outline"
        >
          Increase
        </Button>
      </div>
    </div>
  );
}
