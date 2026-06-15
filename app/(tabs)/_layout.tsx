import React, { useEffect, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { Tabs, useRouter } from 'expo-router';

import { FuturisticTheme } from '@/constants/Colors';
import { getToken } from '@/lib/auth-store';

export default function TabLayout() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // Auth guard: the main app requires a token (real user or guest).
  useEffect(() => {
    getToken().then((token) => {
      if (!token) router.replace('/login');
      else setChecked(true);
    });
  }, [router]);

  if (!checked) return null;

  return (
    <Tabs
      screenOptions={{
        // Each screen renders its own NavBar, so hide the default header.
        headerShown: false,
        tabBarActiveTintColor: FuturisticTheme.accent,
        tabBarInactiveTintColor: FuturisticTheme.textMuted,
        tabBarStyle: {
          backgroundColor: FuturisticTheme.bgMid,
          borderTopColor: FuturisticTheme.divider,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'house.fill',
                android: 'home',
                web: 'house',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'person.circle.fill',
                android: 'person',
                web: 'person',
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'More',
          href: null,
        }}
      />
    </Tabs>
  );
}
