/**
 * Auth group layout. Routes under (auth) render without a tab bar.
 * Currently used for /login.
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
