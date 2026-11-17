import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PropertyCard from '../../components/PropertyCard';
import { propertyApi } from '../../services/api';
import type { Property } from '../../types';

export default function PropertiesTab() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async (pageNum = 1, append = false) => {
    try {
      setError(null);
      const res = await propertyApi.list(undefined, pageNum);
      const newItems = res.data.results;
      setProperties(prev => append ? [...prev, ...newItems] : newItems);
      setHasMore(!!res.data.next);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load properties. Check your connection.');
    }
  }, []);

  useEffect(() => {
    fetchProperties(1).finally(() => setLoading(false));
  }, [fetchProperties]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProperties(1);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchProperties(page + 1, true);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="wifi-outline" size={48} color="#cbd5e1" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchProperties(1).finally(() => setLoading(false))}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={(id) => router.push(`/property/${id}` as any)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563eb" />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="home-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No properties found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: '#64748b', fontSize: 15, textAlign: 'center', marginTop: 12, marginBottom: 20 },
  retryBtn: {
    backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
  },
  retryText: { color: 'white', fontWeight: '600' },
  emptyText: { color: '#94a3b8', fontSize: 15, marginTop: 12 },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
});
