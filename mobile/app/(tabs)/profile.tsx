import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
  TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';

export default function ProfileTab() {
  const router = useRouter();
  const { isAuthenticated, user, logout, loading, updateUser } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.guestContent}>
        <View style={styles.guestHeader}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color="#9ca3af" />
          </View>
          <Text style={styles.guestName}>Guest User</Text>
          <Text style={styles.guestSub}>Sign in to access all features</Text>
        </View>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push('/auth/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.loginBtnText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => router.push('/auth/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.registerBtnText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.menu}>
          <MenuItem icon="home-outline" label="Browse Properties" onPress={() => router.push('/(tabs)')} />
          <MenuItem icon="cube-outline" label="3D Tours" onPress={() => router.push('/(tabs)/tours')} />
        </View>
      </ScrollView>
    );
  }

  return <AuthenticatedProfile user={user} logout={logout} updateUser={updateUser} />;
}

// ─── Authenticated profile ────────────────────────────────────────────────────

function AuthenticatedProfile({
  user,
  logout,
  updateUser,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  logout: () => Promise<void>;
  updateUser: (u: typeof user) => void;
}) {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone ?? '',
  });

  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();
  const roleLabel = user.role.replace('_', ' ');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  // Fix #41: Save profile changes via PATCH /api/v1/auth/profile/
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authApi.updateProfile(form);
      updateUser(res.data);
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to update profile. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.authHeader}>
        <View style={styles.initialsCircle}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </View>

      {/* Fix #41: inline edit form */}
      {editMode ? (
        <View style={styles.editSection}>
          <Text style={styles.editTitle}>Edit Profile</Text>
          <Text style={styles.editLabel}>First Name</Text>
          <TextInput
            style={styles.editInput}
            value={form.first_name}
            onChangeText={v => setForm(f => ({ ...f, first_name: v }))}
            placeholder="First name"
          />
          <Text style={styles.editLabel}>Last Name</Text>
          <TextInput
            style={styles.editInput}
            value={form.last_name}
            onChangeText={v => setForm(f => ({ ...f, last_name: v }))}
            placeholder="Last name"
          />
          <Text style={styles.editLabel}>Phone</Text>
          <TextInput
            style={styles.editInput}
            value={form.phone}
            onChangeText={v => setForm(f => ({ ...f, phone: v }))}
            placeholder="+254..."
            keyboardType="phone-pad"
          />
          <View style={styles.editBtns}>
            <TouchableOpacity
              style={[styles.editBtn, styles.cancelBtn]}
              onPress={() => setEditMode(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editBtn, styles.saveBtn]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.menu}>
          {/* Fix #22: all menu items now have real handlers */}
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => setEditMode(true)}
          />
          <MenuItem
            icon="heart-outline"
            label="Saved Properties"
            onPress={() => router.push('/favorites' as any)}
          />
          <MenuItem
            icon="chatbubble-outline"
            label="My Inquiries"
            onPress={() => router.push('/inquiries' as any)}
          />
          <MenuItem
            icon="cube-outline"
            label="3D Tours"
            onPress={() => router.push('/(tabs)/tours')}
          />
          {(user.role === 'agent' || user.role === 'landlord') && (
            <MenuItem
              icon="business-outline"
              label="My Listings"
              onPress={() => router.push('/my-listings' as any)}
            />
          )}
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={22} color="#4b5563" />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" style={styles.menuArrow} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  guestContent: { padding: 24 },
  guestHeader: { alignItems: 'center', paddingVertical: 32 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  guestName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  guestSub: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  loginBtn: {
    backgroundColor: '#2563eb', borderRadius: 12, height: 50,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  loginBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  registerBtn: {
    borderWidth: 1.5, borderColor: '#2563eb', borderRadius: 12, height: 50,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  registerBtnText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  authHeader: {
    alignItems: 'center', backgroundColor: 'white',
    paddingVertical: 32, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  initialsCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  initialsText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#64748b', marginBottom: 10 },
  roleBadge: {
    backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  roleText: { color: '#2563eb', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  menu: {
    backgroundColor: 'white', marginTop: 20,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  menuLabel: { flex: 1, fontSize: 15, color: '#374151', marginLeft: 14 },
  menuArrow: { marginLeft: 'auto' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: 24, padding: 16, borderRadius: 12,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '600', marginLeft: 8 },
  // Edit form
  editSection: {
    backgroundColor: 'white', margin: 16, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  editTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  editLabel: { fontSize: 13, color: '#64748b', marginBottom: 4, marginTop: 12 },
  editInput: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: '#1e293b',
  },
  editBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  editBtn: { flex: 1, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  cancelBtnText: { color: '#64748b', fontSize: 15, fontWeight: '600' },
  saveBtn: { backgroundColor: '#2563eb' },
  saveBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },
});
