import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="property/[id]" options={{ headerTitle: 'Property Details' }} />
        <Stack.Screen name="auth/login" options={{ headerTitle: 'Sign In', presentation: 'modal' }} />
        <Stack.Screen name="auth/register" options={{ headerTitle: 'Create Account', presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}
