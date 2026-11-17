import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Alert, Linking, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Property, Tour } from '../../types';
import { propertyApi, tourApi, inquiryApi } from '../../services/api';
import TourViewer from '../../components/TourViewer';
import { useAuth } from '../../contexts/AuthContext';

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [favorited, setFavorited] = useState(false);

  // Inquiry form
  const [inquiryName, setInquiryName] = useState(user ? `${user.first_name} ${user.last_name}` : '');
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || '');
  const [inquiryPhone, setInquiryPhone] = useState(user?.phone || '');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);

    Promise.all([
      propertyApi.detail(numId),
      tourApi.byProperty(numId).catch(() => null),
    ])
      .then(([propRes, tourRes]) => {
        setProperty(propRes.data);
        if (tourRes) setTour(tourRes.data);
      })
      .catch(() => Alert.alert('Error', 'Failed to load property details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendInquiry = async () => {
    if (!property) return;
    if (!inquiryName || !inquiryEmail || !inquiryMessage) {
      Alert.alert('Missing fields', 'Please fill in your name, email, and message.');
      return;
    }
    setSendingInquiry(true);
    try {
      await inquiryApi.create({
        property: property.id,
        sender_name: inquiryName,
        sender_email: inquiryEmail,
        sender_phone: inquiryPhone,
        message: inquiryMessage,
      });
      Alert.alert('Sent!', 'Your inquiry has been sent to the agent.');
      setInquiryMessage('');
    } catch {
      Alert.alert('Error', 'Failed to send inquiry. Please try again.');
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#fca5a5" />
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showTour && tour) {
    // Build the tour URL pointing at our web app's tour viewer
    const tourUrl = `${process.env.EXPO_PUBLIC_WEB_URL || 'http://10.0.2.2:5173'}/properties/${property.id}?tour=1`;
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.closeTourBtn} onPress={() => setShowTour(false)}>
          <Ionicons name="close" size={22} color="white" />
          <Text style={styles.closeTourText}>Close Tour</Text>
        </TouchableOpacity>
        <TourViewer url={tourUrl} />
      </View>
    );
  }

  const images = property.images?.length
    ? property.images
    : [{ id: 0, url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', is_primary: true, order: 0 }];

  const formattedPrice =
    property.listing_type === 'rent'
      ? `KSh ${property.price.toLocaleString()}/mo`
      : `KSh ${property.price.toLocaleString()}`;

  const agentName = property.agent
    ? `${property.agent.user.first_name} ${property.agent.user.last_name}`
    : 'Kejapoa Agent';

  const agentPhone = property.agent?.user?.phone || '';
  const agentEmail = property.agent?.user?.email || '';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image gallery */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: images[activeImage]?.url }} style={styles.mainImage} />

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, property.listing_type === 'sale' ? styles.badgeSale : styles.badgeRent]}>
            <Text style={styles.badgeText}>For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}</Text>
          </View>
          {property.featured && (
            <View style={[styles.badge, styles.badgeFeatured]}>
              <Text style={styles.badgeText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Favorite */}
        <TouchableOpacity style={styles.favoriteBtn} onPress={() => setFavorited(f => !f)}>
          <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={22} color={favorited ? '#ef4444' : 'white'} />
        </TouchableOpacity>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbStrip}>
            {images.map((img, i) => (
              <TouchableOpacity key={img.id} onPress={() => setActiveImage(i)}>
                <Image
                  source={{ uri: img.url }}
                  style={[styles.thumb, activeImage === i && styles.thumbActive]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.content}>
        {/* Price & title */}
        <Text style={styles.price}>{formattedPrice}</Text>
        <Text style={styles.title}>{property.title}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.location}>{property.address}, {property.city}, {property.state}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Ionicons name="bed-outline" size={22} color="#2563eb" />
            <Text style={styles.statValue}>{property.bedrooms}</Text>
            <Text style={styles.statLabel}>Bedrooms</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Ionicons name="water-outline" size={22} color="#2563eb" />
            <Text style={styles.statValue}>{property.bathrooms}</Text>
            <Text style={styles.statLabel}>Bathrooms</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Ionicons name="resize-outline" size={22} color="#2563eb" />
            <Text style={styles.statValue}>{property.area_sqft.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Sq. Ft.</Text>
          </View>
        </View>

        {/* 3D Tour button */}
        {tour && (
          <TouchableOpacity style={styles.tourButton} onPress={() => setShowTour(true)} activeOpacity={0.85}>
            <Ionicons name="cube-outline" size={22} color="white" />
            <Text style={styles.tourButtonText}>View 3D Tour ({tour.scenes.length} scenes)</Text>
          </TouchableOpacity>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this property</Text>
          <Text style={styles.description}>{property.description}</Text>

          <View style={styles.detailGrid}>
            <DetailRow label="Type" value={property.property_type} />
            <DetailRow label="Listing" value={`For ${property.listing_type}`} />
            <DetailRow label="City" value={property.city} />
            {property.category && <DetailRow label="Category" value={property.category.name} />}
          </View>
        </View>

        {/* Amenities */}
        {property.amenities?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.map(a => (
                <View key={a.id} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.amenityText}>{a.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Agent card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listed by</Text>
          <View style={styles.agentCard}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentInitials}>
                {property.agent
                  ? `${property.agent.user.first_name[0]}${property.agent.user.last_name[0]}`
                  : 'KP'}
              </Text>
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{agentName}</Text>
              <Text style={styles.agentAgency}>{property.agent?.agency_name || 'Kejapoa Realty'}</Text>
              {property.agent?.verified && (
                <View style={styles.verifiedRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text style={styles.verifiedText}>Verified Agent</Text>
                </View>
              )}
            </View>
            <View style={styles.agentActions}>
              {agentPhone ? (
                <TouchableOpacity
                  style={styles.agentBtn}
                  onPress={() => Linking.openURL(`tel:${agentPhone}`)}
                >
                  <Ionicons name="call" size={18} color="white" />
                </TouchableOpacity>
              ) : null}
              {agentEmail ? (
                <TouchableOpacity
                  style={[styles.agentBtn, styles.agentBtnOutline]}
                  onPress={() => Linking.openURL(`mailto:${agentEmail}`)}
                >
                  <Ionicons name="mail-outline" size={18} color="#2563eb" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Inquiry form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Inquiry</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name *"
            placeholderTextColor="#9ca3af"
            value={inquiryName}
            onChangeText={setInquiryName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email address *"
            placeholderTextColor="#9ca3af"
            value={inquiryEmail}
            onChangeText={setInquiryEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#9ca3af"
            value={inquiryPhone}
            onChangeText={setInquiryPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={`I'm interested in ${property.title}. Please contact me.`}
            placeholderTextColor="#9ca3af"
            value={inquiryMessage}
            onChangeText={setInquiryMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.sendBtn, sendingInquiry && styles.sendBtnDisabled]}
            onPress={handleSendInquiry}
            disabled={sendingInquiry}
            activeOpacity={0.85}
          >
            {sendingInquiry
              ? <ActivityIndicator color="white" size="small" />
              : (
                <>
                  <Ionicons name="send-outline" size={18} color="white" />
                  <Text style={styles.sendBtnText}>Send Message</Text>
                </>
              )
            }
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { color: '#64748b', fontSize: 13 },
  value: { color: '#1e293b', fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: '#64748b', fontSize: 16, marginTop: 12 },
  backBtn: { marginTop: 16, backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: 'white', fontWeight: '600' },

  // Image
  imageContainer: { position: 'relative' },
  mainImage: { width: '100%', height: 280 },
  badgeRow: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeSale: { backgroundColor: '#2563eb' },
  badgeRent: { backgroundColor: '#f59e0b' },
  badgeFeatured: { backgroundColor: '#10b981' },
  badgeText: { color: 'white', fontSize: 11, fontWeight: '600' },
  favoriteBtn: {
    position: 'absolute', top: 14, right: 14,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  thumbStrip: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 8, paddingHorizontal: 12 },
  thumb: { width: 56, height: 40, borderRadius: 6, marginRight: 8, opacity: 0.7 },
  thumbActive: { opacity: 1, borderWidth: 2, borderColor: 'white' },

  // Content
  content: { padding: 20 },
  price: { fontSize: 26, fontWeight: 'bold', color: '#2563eb', marginBottom: 6 },
  title: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  location: { color: '#6b7280', fontSize: 14, marginLeft: 6, flex: 1 },

  // Stats
  statsCard: {
    flexDirection: 'row', backgroundColor: '#f8fafc',
    borderRadius: 14, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginTop: 6 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#e2e8f0', marginHorizontal: 8 },

  // Tour button
  tourButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f59e0b', borderRadius: 14, padding: 16, marginBottom: 24, gap: 10,
  },
  tourButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },

  // Sections
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b', marginBottom: 14 },
  description: { fontSize: 14, lineHeight: 22, color: '#4b5563', marginBottom: 16 },
  detailGrid: { marginTop: 8 },

  // Amenities
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, gap: 6,
  },
  amenityText: { color: '#166534', fontSize: 13, fontWeight: '500' },

  // Agent
  agentCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  agentAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  agentInitials: { color: '#2563eb', fontSize: 16, fontWeight: '700' },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  agentAgency: { fontSize: 13, color: '#64748b', marginTop: 2 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  verifiedText: { color: '#10b981', fontSize: 12, fontWeight: '500' },
  agentActions: { flexDirection: 'row', gap: 8 },
  agentBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center',
  },
  agentBtnOutline: {
    backgroundColor: 'white', borderWidth: 1.5, borderColor: '#2563eb',
  },

  // Inquiry form
  input: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10,
    paddingHorizontal: 14, height: 48, fontSize: 14,
    color: '#1e293b', backgroundColor: '#f8fafc', marginBottom: 12,
  },
  textArea: { height: 100, paddingTop: 12 },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2563eb', borderRadius: 12, height: 50, gap: 8,
  },
  sendBtnDisabled: { backgroundColor: '#93c5fd' },
  sendBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },

  // Tour overlay
  closeTourBtn: {
    position: 'absolute', top: 50, right: 16, zIndex: 10,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, gap: 6,
  },
  closeTourText: { color: 'white', fontWeight: '600' },
});
