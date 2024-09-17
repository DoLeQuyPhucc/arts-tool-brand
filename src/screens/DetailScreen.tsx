import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { AntDesign } from '@expo/vector-icons';
import { FavoriteContext } from '../context/FavoriteContext';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types/navigationTypes';

interface ArtTool {
  id: string;
  artName: string;
  price: number;
  image: string;
  limitedTimeDeal: number;
  description: string;
  ratings: number;
  comments: string;
}

type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DetailScreen'>;

const DetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<DetailScreenNavigationProp>();
  const { id } = route.params as { id: string };

  const [artTool, setArtTool] = useState<ArtTool | null>(null);
  const favoriteContext = useContext(FavoriteContext);

  if (!favoriteContext) {
    return <Text>Loading...</Text>;
  }

  const { favorites, toggleFavorite } = favoriteContext;

  // Fetch the art tool data from the API
  const fetchArtTool = async () => {
    try {
      const response = await axios.get(`https://66e1bb3ec831c8811b56281f.mockapi.io/arts/${id}`);
      setArtTool(response.data);
    } catch (error) {
      console.error('Error fetching art tool details:', error);
    }
  };

  useEffect(() => {
    fetchArtTool();
  }, [id]);

  // Set the options for the header, including the three-dot menu
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <AntDesign name="ellipsis1" size={24} color="black" style={{ marginRight: 10 }} />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => navigation.navigate('Main', { screen: 'Home' })}>
              <Text style={styles.menuText}>Back to Home</Text>
            </MenuOption>
            <MenuOption onSelect={() => navigation.navigate('Main', { screen: 'Favorites' })}>
              <Text style={styles.menuText}>Go to Favorites</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      ),
    });
  }, [navigation]);

  if (!artTool) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailContainer}>
        <Image source={{ uri: artTool.image }} style={styles.image} resizeMode="cover" />
        <Text style={styles.title}>{artTool.artName}</Text>
        <Text style={styles.price}>Price: ${artTool.price}</Text>
        {artTool.limitedTimeDeal > 0 && (
          <Text style={styles.deal}>Limited Time Deal: -{(artTool.limitedTimeDeal * 100).toFixed(0)}%</Text>
        )}
        <Text style={styles.description}>{artTool.description}</Text>

        <View style={styles.ratingsContainer}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <View style={styles.ratingGroup}>
            <Text style={styles.ratingValue}>{artTool.ratings} Star{artTool.ratings > 1 ? 's' : ''}</Text>
            <AntDesign name="star" size={24} color="#f1c40f" />
          </View>
        </View>

        {/* Add to Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(artTool.id)}
        >
          <AntDesign
            name={favorites.includes(artTool.id) ? 'heart' : 'hearto'}
            size={24}
            color={favorites.includes(artTool.id) ? 'red' : 'gray'}
          />
          <Text style={styles.favoriteText}>
            {favorites.includes(artTool.id) ? 'Remove from Favorites' : 'Add to Favorites'}
          </Text>
        </TouchableOpacity>

        {/* Static Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Comments</Text>
          <Text>{artTool.comments}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContainer: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    marginBottom: 8,
    color: '#2c3e50',
  },
  deal: {
    fontSize: 16,
    color: 'red',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 16,
  },
  ratingsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  menuText: {
    fontSize: 16,
    padding: 10,
  },
  commentsSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default DetailScreen;
