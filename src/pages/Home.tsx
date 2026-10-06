"use client";

import { useApp } from '@/context/AppContext';
import LandingPage from '@/components/landing/LandingPage';
import MemberHome from './MemberHome';

export default function Home() {
  const { isLoggedIn } = useApp();
  return isLoggedIn ? <MemberHome /> : <LandingPage />;
}
