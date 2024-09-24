import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { FavoriteContext } from '../context/FavoriteContext';

interface ArtTool {
  id: string;
  artName: string;
  image: string;
  price: number;
  limitedTimeDeal: number;
  brand: string;
}

const HomeScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [artTools, setArtTools] = useState<ArtTool[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const favoriteContext = useContext(FavoriteContext);

  if (!favoriteContext) {
    return <Text>Loading...</Text>;
  }

  const { favorites, toggleFavorite } = favoriteContext;

  // Fetch art tools from the API
  const fetchArtTools = async () => {
    try {
      const response = await axios.get('https://66e1bb3ec831c8811b56281f.mockapi.io/arts');
      const tools = response.data;
      setArtTools(tools);
      await AsyncStorage.setItem('artTools', JSON.stringify(response.data));

      const uniqueBrands: string[] = Array.from(new Set(tools.map((tool: ArtTool) => tool.brand)));
      setBrands(['All', ...uniqueBrands]);
    } catch (error) {
      console.error('Error fetching art tools:', error);
    }
  };

  useEffect(() => {
    fetchArtTools();
  }, []);

  // Filter art tools by both search query and selected brand
  const filteredArtTools = artTools
    .filter(tool => tool.artName.toLowerCase().includes(searchQuery.toLowerCase())) // Apply search filter
    .filter(tool => selectedBrand === 'All' || tool.brand === selectedBrand); // Apply brand filter

    const renderArtTool = ({ item }: { item: ArtTool }) => {
      const startIndex = item.artName.toLowerCase().indexOf(searchQuery.toLowerCase());
    
      const highlightText = () => {
        if (startIndex !== -1) {
          const beforeMatch = item.artName.substring(0, startIndex);
          const match = item.artName.substring(startIndex, startIndex + searchQuery.length);
          const afterMatch = item.artName.substring(startIndex + searchQuery.length);
    
          return (
            <Text style={styles.artName}>
              {beforeMatch}
              <Text style={styles.highlight}>{match}</Text>
              {afterMatch}
            </Text>
          );
        }
        return <Text style={styles.artName}>{item.artName}</Text>;
      };
    
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Detail', { id: item.id })}
        >
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          <View style={styles.info}>
            {highlightText()}
            <Text style={styles.price}>${item.price}</Text>
            {item.limitedTimeDeal > 0 && <Text style={styles.deal}>-{item.limitedTimeDeal}%</Text>}
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
            <AntDesign
              name={favorites.includes(item.id) ? 'heart' : 'hearto'}
              size={24}
              color={favorites.includes(item.id) ? 'red' : 'gray'}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    };
    

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search art tools..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Brand filter UI */}
      <View style={styles.brandContainer}>
        <FlatList
          data={brands}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedBrand(item)}>
              <Text style={[styles.brand, selectedBrand === item && styles.selectedBrand]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Art tools list */}
      {filteredArtTools.length === 0 ? (
        <Text style={styles.emptyMessage}>No results found</Text>
      ) : (
        <FlatList
          data={filteredArtTools}
          keyExtractor={(item) => item.id}
          renderItem={renderArtTool}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    padding: 10,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
  },
  brandContainer: {
    marginBottom: 16,
  },
  brand: {
    marginRight: 10,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  selectedBrand: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  artName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: '#888',
  },
  deal: {
    fontSize: 12,
    color: 'red',
    fontWeight: 'bold',
  },
  highlight: {
    backgroundColor: 'yellow',
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default HomeScreen;
