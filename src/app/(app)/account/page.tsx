import AccountForm from './account-form';
import { supabase } from '@/lib/supabase-client';

export default async function AccountPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col p-4 lg:p-6">
      <AccountForm user={user} />
    </main>
  );
}

