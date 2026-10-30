import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <main className="main-content">
      <Outlet />
    </main>
  );
}
