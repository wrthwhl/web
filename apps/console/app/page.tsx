import { redirect } from 'next/navigation';

export default function Index() {
  // Redirect to dashboard
  redirect('/dashboard');
}
