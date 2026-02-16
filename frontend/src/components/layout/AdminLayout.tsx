import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div data-theme="night" className="relative min-h-screen overflow-x-hidden bg-base-100 text-base-content">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% -10%, rgba(88,101,242,0.35), transparent 40%), radial-gradient(circle at 100% 0%, rgba(147,112,219,0.18), transparent 34%)',
        }}
      />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-6 md:py-12">
        <Outlet />
      </main>
    </div>
  );
}
