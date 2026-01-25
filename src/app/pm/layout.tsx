import PMNavigation from '@/components/pm/PMNavigation';

export default function PMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PMNavigation />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}
