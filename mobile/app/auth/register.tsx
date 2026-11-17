import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
    role: 'client' as 'client' | 'agent' | 'landlord',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (form.password !== form.password_confirm) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      router.replace('/(tabs)');
    } catch (err: any) {
      const data = err?.response?.data;
      const msg = data
        ? Object.values(data).flat().join('\n')
        : 'Registration failed. Please try again.';
      Alert.alert('Registration failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: typeof form.role; label: string }[] = [
    { value: 'client', label: 'Buyer / Tenant' },
    { value: 'agent', label: 'Real Estate Agent' },
    { value: 'landlord', label: 'Landlord / Owner' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <Ionicons name="business" size={36} color="#2563eb" />
          <Text style={styles.logoText}>Kejapoa</Text>
        </View>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join thousands finding their dream property</Text>

        {/* Name row */}
        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.flex]}>
            <Text style={styles.label}>First name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John"
              placeholderTextColor="#9ca3af"
              value={form.first_name}
              onChangeText={v => update('first_name', v)}
            />
          </View>
          <View style={styles.rowSpacer} />
          <View style={[styles.fieldGroup, styles.flex]}>
            <Text style={styles.label}>Last name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Doe"
              placeholderTextColor="#9ca3af"
              value={form.last_name}
              onChangeText={v => update('last_name', v)}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email address *</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            value={form.email}
            onChangeText={v => update('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="+254 700 000 000"
            placeholderTextColor="#9ca3af"
            value={form.phone}
            onChangeText={v => update('phone', v)}
            keyboardType="phone-pad"
          />
        </View>

        {/* Role selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>I am a</Text>
          <View style={styles.roleRow}>
            {roles.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleBtn, form.role === r.value && styles.roleBtnActive]}
                onPress={() => update('role', r.value)}
              >
                <Text style={[styles.roleBtnText, form.role === r.value && styles.roleBtnTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password *</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Min. 8 characters"
              placeholderTextColor="#9ca3af"
              value={form.password}
              onChangeText={v => update('password', v)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Repeat password"
            placeholderTextColor="#9ca3af"
            value={form.password_confirm}
            onChangeText={v => update('password_confirm', v)}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.btnText}>Create Account</Text>
          }
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={styles.switchLink}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 24, paddingTop: 40, backgroundColor: '#fff' },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  logoText: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginLeft: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 28 },
  row: { flexDirection: 'row' },
  rowSpacer: { width: 12 },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1 },
  eyeBtn: { position: 'absolute', right: 14, padding: 4 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  roleBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  roleBtnText: { fontSize: 13, color: '#64748b' },
  roleBtnTextActive: { color: 'white', fontWeight: '600' },
  btn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  btnDisabled: { backgroundColor: '#93c5fd' },
  btnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 32 },
  switchText: { color: '#64748b', fontSize: 14 },
  switchLink: { color: '#2563eb', fontSize: 14, fontWeight: '600' },
});
