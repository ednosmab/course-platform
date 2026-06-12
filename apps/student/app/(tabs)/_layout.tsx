/**
 * Tabs group layout. Hosts the bottom tab navigation for authenticated students.
 * For now we use a Stack (no bottom tabs UI) because the existing
 * StudentDashboard already has its own in-page tab switcher. When the design
 * introduces a real tab bar, swap the Stack below for a Tabs component.
 */

import { Stack } from 'expo-router';

export default function TabsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
