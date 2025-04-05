import Counter from "../components/Counter";
import PingBackend from "../components/PingBackend";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Image Ranker</h1>
      <PingBackend />
      <div className="mt-8">
        <Counter />
      </div>
    </div>
  );
}
