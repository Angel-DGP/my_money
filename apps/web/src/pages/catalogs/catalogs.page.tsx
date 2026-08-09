import { Outlet } from 'react-router-dom';

export function CatalogsPage() {
  return (
    <div className="flex-1 flex flex-col h-full">
      <Outlet />
    </div>
  );
}
