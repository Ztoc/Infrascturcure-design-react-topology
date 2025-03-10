import { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PageLayout({
  title,
  subtitle,
  children,
}: PageLayoutProps) {
  return (
    <div className="animate-scale-in px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-screen-2xl mx-auto h-[calc(100vh-64px)] overflow-auto">
      {title && (
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-muted-foreground max-w-3xl">{subtitle}</p>
          )}
        </div>
      )}
      <div className="animate-fade-in">{children}</div>
    </div>
  );
}
