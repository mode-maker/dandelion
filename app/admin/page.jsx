// app/admin/page.jsx
import AdminApp from './AdminApp';

export const dynamic = 'force-dynamic'; // чтобы /admin не кешировался

export default function Page() {
  return <AdminApp />;
}
