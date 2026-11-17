import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Property } from '../types';

interface Props {
  property: Property;
  onPress: (id: number) => void;
}

export default function PropertyCard({ property, onPress }: Props) {
  const [favorited, setFavorited] = useState(false);

  // Use first image or fallback
  const imageUrl =
    property.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';

  const agentName = property.agent
    ? `${property.agent.user.first_name} ${property.agent.user.last_name}`
    : 'Kejapoa Agent';

  const formattedPrice =
    property.listing_type === 'rent'
      ? `KSh ${property.price.toLocaleString()}/mo`
      : `KSh ${property.price.toLocaleString()}`;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(property.id)} activeOpacity={0.9}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, property.listing_type === 'sale' ? styles.badgeSale : styles.badgeRent]}>
            <Text style={styles.badgeText}>
              For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
            </Text>
          </View>
          {property.featured && (
            <View style={[styles.badge, styles.badgeFeatured]}>
              <Text style={styles.badgeText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Favorite button */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={(e) => { e.stopPropagation?.(); setFavorited(f => !f); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={20}
            color={favorited ? '#ef4444' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.price}>{formattedPrice}</Text>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.location} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="bed-outline" size={15} color="#6b7280" />
            <Text style={styles.statText}>{property.bedrooms} Beds</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Ionicons name="water-outline" size={15} color="#6b7280" />
            <Text style={styles.statText}>{property.bathrooms} Baths</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Ionicons name="resize-outline" size={15} color="#6b7280" />
            <Text style={styles.statText}>{property.area_sqft.toLocaleString()} sqft</Text>
          </View>
        </View>

        {/* Agent row */}
        <View style={styles.agentRow}>
          <View style={styles.agentAvatar}>
            <Text style={styles.agentInitials}>
              {property.agent
                ? `${property.agent.user.first_name[0]}${property.agent.user.last_name[0]}`
                : 'KP'}
            </Text>
          </View>
          <Text style={styles.agentName}>{agentName}</Text>
          <View style={styles.tourBtn}>
            <Ionicons name="cube-outline" size={14} color="#2563eb" />
            <Text style={styles.tourBtnText}>3D Tour</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 200 },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeSale: { backgroundColor: '#2563eb' },
  badgeRent: { backgroundColor: '#f59e0b' },
  badgeFeatured: { backgroundColor: '#10b981' },
  badgeText: { color: 'white', fontSize: 11, fontWeight: '600' },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 14 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  location: { color: '#6b7280', fontSize: 13, marginLeft: 4, flex: 1 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginBottom: 10,
  },
  stat: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  statText: { color: '#4b5563', fontSize: 12, marginLeft: 4 },
  statDivider: { width: 1, height: 16, backgroundColor: '#e2e8f0' },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  agentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  agentInitials: { color: '#2563eb', fontSize: 11, fontWeight: '700' },
  agentName: { flex: 1, fontSize: 12, color: '#64748b' },
  tourBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  tourBtnText: { color: '#2563eb', fontSize: 12, fontWeight: '600' },
});
