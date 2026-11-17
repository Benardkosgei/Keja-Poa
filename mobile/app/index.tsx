import { Redirect } from 'expo-router';

export default function StartScreen() {
  // Redirect to the home tab
  return <Redirect href="/(tabs)" />;
}
