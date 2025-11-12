import { redirect } from 'next/navigation';

export default async function RootPage() {
  // Redirect to landing page - users will be redirected to dashboard after login
  redirect('/landing');
}
