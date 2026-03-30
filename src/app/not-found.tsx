import '@/styles/globals.css';

export default function GlobalNotFound() {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className="grain bg-surface-base text-on-surface antialiased min-h-dvh flex flex-col items-center justify-center px-6">
        <p className="font-mono text-sm tracking-widest text-primary mb-6">// 404</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
          Page not found
        </h1>
        <p className="text-on-surface/50 text-lg mb-10 text-center max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a href="/" className="btn-primary">
          Back to Home
        </a>
      </body>
    </html>
  );
}
