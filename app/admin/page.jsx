export const dynamic = 'force-dynamic';
export const revalidate = 0; // (или false)
export const fetchCache = 'force-no-store';

import AdminApp from './AdminApp';

export default function Page() {
  return <AdminApp />;
}
