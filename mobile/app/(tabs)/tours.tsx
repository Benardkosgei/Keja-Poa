import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { propertyApi, tourApi } from '../../services/api';
import type { Property } from '../../types';

export default function ToursTab() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTourProperties = useCallback(async () => {
    try {
      setError(null);
      // Fix #6: FeaturedPropertiesView now returns paginated response — use .results
      // Fix #42: Filter to only properties that actually have a published tour
      const res = await propertyApi.featured();
      // res.data is PaginatedResponse<Property> — safely extract results array
      const allFeatured: Property[] = res.data?.results ?? [];

      // Check each property for a real tour in parallel (cap at 20 to avoid hammering the API)
      const candidates = allFeatured.slice(0, 20);
      const tourChecks = await Promise.allSettled(
        candidates.map(p => tourApi.byProperty(p.id))
      );
      const withTours = candidates.filter((_, i) => tourChecks[i].status === 'fulfilled');

      if (withTours.length > 0) {
        setProperties(withTours);
      } else {
        // Fallback: show all featured properties when no tours are published yet
        setProperties(allFeatured.slice(0, 10));
      }
    } catch {
      // Last-resort fallback: plain property list
      try {
        const res = await propertyApi.list();
        const results: Property[] = res.data?.results ?? [];
        setProperties(results.slice(0, 10));
      } catch {
        setError('Failed to load tours. Check your connection.');
      }
    }
  }, []);

  useEffect(() => {
    fetchTourProperties().finally(() => setLoading(false));
  }, [fetchTourProperties]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTourProperties();
    setRefreshing(false);
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
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            setLoading(true);
            fetchTourProperties().finally(() => setLoading(false));
          }}
        >
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563eb" />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>3D Virtual Tours</Text>
            <Text style={styles.headerSubtitle}>Explore properties from anywhere</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TourCard
            property={item}
            onPress={() => router.push(`/property/${item.id}` as any)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="cube-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No tours available</Text>
            <Text style={styles.emptySubtitle}>Check back soon for new virtual tours</Text>
          </View>
        }
      />
    </View>
  );
}

function TourCard({ property, onPress }: { property: Property; onPress: () => void }) {
  const imageUrl =
    property.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
        <View style={styles.overlay} />
        <View style={styles.playBtn}>
          <Ionicons name="play" size={28} color="white" />
        </View>
        <View style={styles.sceneBadge}>
          <Ionicons name="cube-outline" size={12} color="white" />
          <Text style={styles.sceneBadgeText}>3D Tour</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{property.title}</Text>
        <View style={styles.cardMeta}>
          <Ionicons name="location-outline" size={13} color="#6b7280" />
          <Text style={styles.cardCity}>{property.city}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>
            KSh {Number(property.price).toLocaleString()}
            {property.listing_type === 'rent' ? '/mo' : ''}
          </Text>
          <View style={styles.viewTourBtn}>
            <Text style={styles.viewTourText}>View Tour</Text>
            <Ionicons name="arrow-forward" size={14} color="#2563eb" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: '#64748b', fontSize: 15, textAlign: 'center', marginTop: 12, marginBottom: 20 },
  retryBtn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: 'white', fontWeight: '600' },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b', marginTop: 14 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 6, textAlign: 'center' },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  card: {
    backgroundColor: 'white', borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  imageWrapper: { position: 'relative' },
  thumbnail: { width: '100%', height: 200 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)', height: 200 },
  playBtn: {
    position: 'absolute', top: '50%', left: '50%',
    marginTop: -28, marginLeft: -28, width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(37,99,235,0.85)', justifyContent: 'center', alignItems: 'center',
  },
  sceneBadge: {
    position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, gap: 4,
  },
  sceneBadgeText: { color: 'white', fontSize: 11, fontWeight: '600' },
  cardContent: { padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  cardCity: { color: '#6b7280', fontSize: 13 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' },
  viewTourBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewTourText: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
});
