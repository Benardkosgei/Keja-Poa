import os

base_dir = "/workspace/kejapoa/mobile"

files = {
    "types/index.ts": """export interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  agent: {
    name: string;
    phone: string;
  };
  description?: string;
  featured?: boolean;
}

export interface Tour {
  id: number;
  propertyId: number;
  propertyName: string;
  thumbnailUrl: string;
  sceneCount: number;
  tourUrl: string;
}
""",

    "services/api.ts": """import axios from 'axios';

const API_BASE_URL = 'http://YOUR_BACKEND_URL/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const api = {
  properties: {
    list: (params?: object) => apiClient.get('/properties/', { params }),
    detail: (id: number) => apiClient.get(`/properties/${id}/`),
    featured: () => apiClient.get('/properties/', { params: { featured: true } }),
  },
  tours: {
    byProperty: (propertyId: number) => apiClient.get(`/tours/property/${propertyId}/`),
  },
  auth: {
    login: (data: object) => apiClient.post('/auth/login/', data),
    register: (data: object) => apiClient.post('/auth/register/', data),
  },
};
""",

    "components/PropertyCard.tsx": """import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types';

interface Props {
  property: Property;
  onPress: (id: number) => void;
}

export default function PropertyCard({ property, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(property.id)}>
      <Image source={{ uri: property.imageUrl || 'https://via.placeholder.com/300x200' }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.price}>${property.price.toLocaleString()}</Text>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.location}>{property.location}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="bed-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{property.bedrooms} Beds</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="water-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{property.bathrooms} Baths</Text>
          </View>
        </View>
        <Text style={styles.agent}>Agent: {property.agent.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    color: '#6b7280',
    marginLeft: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
},
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    color: '#4b5563',
    marginLeft: 4,
  },
  agent: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
""",

    "components/SearchBar.tsx": """import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
}

export default function SearchBar({ value, onChangeText, onFilterPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search location, property type..."
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <Ionicons name="options-outline" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginRight: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  filterButton: {
    backgroundColor: '#2563eb',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
""",

    "components/TourViewer.tsx": """import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  url: string;
}

export default function TourViewer({ url }: Props) {
  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: url }} 
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  }
});
""",

    "app/_layout.tsx": """import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ headerTitle: 'Property Details' }} />
    </Stack>
  );
}
""",

    "app/index.tsx": """import { Redirect } from 'expo-router';

export default function StartScreen() {
  // Redirect to the home tab
  return <Redirect href="/(tabs)" />;
}
""",

    "app/(tabs)/_layout.tsx": """import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Properties',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tours"
        options={{
          title: '3D Tours',
          tabBarIcon: ({ color }) => <Ionicons name="cube" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
""",

    "app/(tabs)/index.tsx": """import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import PropertyCard from '../../components/PropertyCard';
import { api } from '../../services/api';
import { Property } from '../../types';

export default function PropertiesTab() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from the API:
    // api.properties.list().then(res => setProperties(res.data)).catch(console.error);
    
    // Mock data for display
    setTimeout(() => {
      setProperties([
        {
          id: 1,
          title: 'Modern Luxury Villa',
          price: 1250000,
          location: 'Beverly Hills, CA',
          bedrooms: 4,
          bathrooms: 3,
          imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          agent: { name: 'John Doe', phone: '123-456-7890' },
          featured: true,
        },
        {
          id: 2,
          title: 'Cozy Downtown Apartment',
          price: 450000,
          location: 'Downtown LA, CA',
          bedrooms: 2,
          bathrooms: 2,
          imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          agent: { name: 'Jane Smith', phone: '098-765-4321' },
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  list: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
""",

    "app/(tabs)/search.tsx": """import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SearchBar from '../../components/SearchBar';

export default function SearchTab() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <SearchBar 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        onFilterPress={() => console.log('Filter pressed')} 
      />
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Enter a location to start searching</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  }
});
""",

    "app/(tabs)/tours.tsx": """import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock tours data
const TOURS = [
  {
    id: 1,
    propertyId: 1,
    propertyName: 'Modern Luxury Villa',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    sceneCount: 5,
  },
  {
    id: 2,
    propertyId: 2,
    propertyName: 'Cozy Downtown Apartment',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    sceneCount: 3,
  }
];

export default function ToursTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={TOURS}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/property/${item.propertyId}` as any)}
          >
            <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
            <View style={styles.overlay}>
              <Ionicons name="play-circle" size={48} color="white" />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{item.propertyName}</Text>
              <Text style={styles.scenes}>{item.sceneCount} scenes</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: 180,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    height: 180,
  },
  info: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scenes: {
    color: '#6b7280',
  }
});
""",

    "app/(tabs)/profile.tsx": """import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileTab() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#9ca3af" />
        </View>
        <Text style={styles.name}>Guest User</Text>
        <Text style={styles.email}>Sign in to access all features</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="heart-outline" size={24} color="#4b5563" />
          <Text style={styles.menuText}>Saved Properties</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={styles.arrow} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#4b5563" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={styles.arrow} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Log In / Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#6b7280',
  },
  menu: {
    backgroundColor: 'white',
    marginTop: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#4b5563',
  },
  arrow: {
    marginLeft: 'auto',
  },
  button: {
    margin: 24,
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});
""",

    "app/property/[id].tsx": """import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../../types';
import TourViewer from '../../components/TourViewer';

export default function PropertyDetail() {
  const { id } = useLocalSearchParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Mock data fetching
    setTimeout(() => {
      setProperty({
        id: Number(id),
        title: 'Modern Luxury Villa',
        price: 1250000,
        location: 'Beverly Hills, CA',
        bedrooms: 4,
        bathrooms: 3,
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'A stunning modern luxury villa located in the heart of Beverly Hills. Features an open floor plan, gourmet kitchen, infinity pool, and panoramic city views.',
        agent: { name: 'John Doe', phone: '123-456-7890' },
      });
    }, 500);
  }, [id]);

  if (!property) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (showTour) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity 
          style={styles.closeTourBtn} 
          onPress={() => setShowTour(false)}
        >
          <Ionicons name="close" size={24} color="white" />
          <Text style={styles.closeTourText}>Close 3D Tour</Text>
        </TouchableOpacity>
        {/* Placeholder URL for tour viewer */}
        <TourViewer url={`https://my.matterport.com/show/?m=Jgp1AxiUjvE`} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: property.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.price}>${property.price.toLocaleString()}</Text>
        <Text style={styles.title}>{property.title}</Text>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={20} color="#6b7280" />
          <Text style={styles.location}>{property.location}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="bed-outline" size={24} color="#2563eb" />
            <Text style={styles.statValue}>{property.bedrooms}</Text>
            <Text style={styles.statLabel}>Beds</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="water-outline" size={24} color="#2563eb" />
            <Text style={styles.statValue}>{property.bathrooms}</Text>
            <Text style={styles.statLabel}>Baths</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.tourButton} 
          onPress={() => setShowTour(true)}
        >
          <Ionicons name="cube-outline" size={24} color="white" style={styles.tourIcon} />
          <Text style={styles.tourButtonText}>View 3D Tour</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Agent</Text>
          <View style={styles.agentCard}>
            <View style={styles.agentAvatar}>
              <Ionicons name="person" size={24} color="#9ca3af" />
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{property.agent.name}</Text>
              <Text style={styles.agentPhone}>{property.agent.phone}</Text>
            </View>
            <TouchableOpacity style={styles.contactBtn}>
              <Ionicons name="call" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  location: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#6b7280',
    marginTop: 4,
  },
  tourButton: {
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  tourIcon: {
    marginRight: 8,
  },
  tourButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  agentPhone: {
    color: '#6b7280',
  },
  contactBtn: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTourBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  closeTourText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  }
});
""",
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content)

print("All files created successfully!")
