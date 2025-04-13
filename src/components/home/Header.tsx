export default function Header() {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <h1 className="text-6xl font-bold tracking-tight">
        Image{" "}
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Ranker
        </span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Organize and rank your images with ease. A powerful desktop application
        for managing and rating your image collections.
      </p>
    </div>
  );
}
