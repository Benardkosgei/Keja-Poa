import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PropertyCard from '../../components/PropertyCard';
import { propertyApi } from '../../services/api';
import type { Property, PropertyType, ListingType } from '../../types';

const PROPERTY_TYPES: { label: string; value: PropertyType }[] = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Villa', value: 'villa' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Land', value: 'land' },
];

const LISTING_TYPES: { label: string; value: ListingType }[] = [
  { label: 'For Sale', value: 'sale' },
  { label: 'For Rent', value: 'rent' },
];

export default function SearchTab() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [selectedListing, setSelectedListing] = useState<ListingType | null>(null);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await propertyApi.list({
        search: query || undefined,
        property_type: selectedType || undefined,
        listing_type: selectedListing || undefined,
      });
      setResults(res.data.results);
    } catch {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedType, selectedListing]);

  const clearFilters = () => {
    setQuery('');
    setSelectedType(null);
    setSelectedListing(null);
    setResults([]);
    setSearched(false);
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="City, area, or property name..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Type</Text>
        <View style={styles.chipRow}>
          {PROPERTY_TYPES.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[styles.chip, selectedType === t.value && styles.chipActive]}
              onPress={() => setSelectedType(prev => prev === t.value ? null : t.value)}
            >
              <Text style={[styles.chipText, selectedType === t.value && styles.chipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Listing</Text>
        <View style={styles.chipRow}>
          {LISTING_TYPES.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[styles.chip, selectedListing === t.value && styles.chipActive]}
              onPress={() => setSelectedListing(prev => prev === t.value ? null : t.value)}
            >
              <Text style={[styles.chipText, selectedListing === t.value && styles.chipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
          <Ionicons name="search" size={18} color="white" />
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
        {(query || selectedType || selectedListing) && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color="#fca5a5" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !searched ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Find your perfect property</Text>
          <Text style={styles.emptySubtitle}>Enter a location or use the filters above</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="home-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No properties found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search filters</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={(id) => router.push(`/property/${id}` as any)}
            />
          )}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>{results.length} propert{results.length === 1 ? 'y' : 'ies'} found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#1e293b' },
  filtersSection: { paddingHorizontal: 16, paddingTop: 14 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#64748b' },
  chipTextActive: { color: 'white', fontWeight: '600' },
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  searchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 10,
    height: 46,
    gap: 8,
  },
  searchBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },
  clearBtn: {
    paddingHorizontal: 20,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  clearBtnText: { color: '#64748b', fontWeight: '500' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: '#ef4444', fontSize: 14, marginTop: 10, textAlign: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b', marginTop: 14 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 6, textAlign: 'center' },
  resultsList: { padding: 16 },
  resultsCount: { fontSize: 13, color: '#64748b', marginBottom: 12 },
});
