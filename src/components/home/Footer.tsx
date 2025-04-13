import StatusIndicator from "../StatusIndicator";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          © 2025 Image Ranker. All rights reserved.
        </p>
        <StatusIndicator />
      </div>
    </footer>
  );
}
