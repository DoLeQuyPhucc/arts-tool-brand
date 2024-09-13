import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';

interface ArtTool {
  id: string;
  artName: string;
  image: string;
  price: number;
  limitedTimeDeal: number;
}

const FavoritesScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [favoriteArtTools, setFavoriteArtTools] = useState<ArtTool[]>([]);

  // Function to load favorite art tools from AsyncStorage
  const loadFavorites = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const favoriteIds = JSON.parse(favorites);
        const allArtTools = await AsyncStorage.getItem('artTools');
        if (allArtTools) {
          const artTools = JSON.parse(allArtTools);
          const favoriteItems = artTools.filter((tool: ArtTool) => favoriteIds.includes(tool.id));
          setFavoriteArtTools(favoriteItems);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Load favorites whenever screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  // Render art tool item
  const renderArtTool = ({ item }: { item: ArtTool }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Detail', { id: item.id })}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.artName}>{item.artName}</Text>
        <Text style={styles.price}>${item.price}</Text>
        {item.limitedTimeDeal > 0 && <Text style={styles.deal}>-{item.limitedTimeDeal}%</Text>}
      </View>
    </TouchableOpacity>
  );

  // Render empty state UI when no favorites are available
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AntDesign name="frowno" size={64} color="gray" />
      <Text style={styles.emptyText}>No favorites yet!</Text>
      <Text style={styles.emptySubText}>Add your favorite art tools to see them here.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {favoriteArtTools.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favoriteArtTools}
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
  // Styles for empty state UI
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'gray',
  },
  emptySubText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

export default FavoritesScreen;
