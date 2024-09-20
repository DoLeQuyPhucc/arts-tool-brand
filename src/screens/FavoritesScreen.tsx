import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Modal, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, NavigationProp } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';
import { FavoriteContext } from '../context/FavoriteContext';

interface ArtTool {
  id: string;
  artName: string;
  image: string;
  price: number;
  limitedTimeDeal: number;
}

const FavoritesScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [favoriteArtTools, setFavoriteArtTools] = useState<ArtTool[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const favoriteContext = useContext(FavoriteContext);

  if (!favoriteContext) {
    return <Text>Loading...</Text>;
  }

  const { toggleFavorite } = favoriteContext;

  // Load favorites from AsyncStorage
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

      // Reset edit mode when screen gains focus
      setEditMode(false);

      // Cleanup function
      return () => {
        setEditMode(false);
      };
    }, [])
  );

  // Update header to include "Edit" button
  useEffect(() => {
    if (favoriteArtTools.length > 0) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => setEditMode(!editMode)} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>{editMode ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => null,
      });
    }
  }, [navigation, editMode, favoriteArtTools]);

  // Delete a single item
  const deleteItem = async (itemId: string) => {
    try {
      const updatedFavorites = favoriteArtTools.filter((tool) => tool.id !== itemId);
      setFavoriteArtTools(updatedFavorites);
      toggleFavorite(itemId);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites.map((tool) => tool.id)));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Handle select/deselect for multiple deletion
  const toggleSelectItem = (itemId: string) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(itemId)
        ? prevSelected.filter((id) => id !== itemId)
        : [...prevSelected, itemId]
    );
  };

  // Check all items
  const selectAllItems = () => {
    if (selectedItems.length === favoriteArtTools.length) {
      setSelectedItems([]); // Unselect all
    } else {
      setSelectedItems(favoriteArtTools.map((tool) => tool.id)); // Select all
    }
  };

  // Delete selected items
  const deleteSelectedItems = async () => {
    try {
      
      toggleFavorite(selectedItems);
  
      const updatedFavorites = favoriteArtTools.filter((tool) => !selectedItems.includes(tool.id));
      setFavoriteArtTools(updatedFavorites);
  
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites.map((tool) => tool.id)));
  
      
      setSelectedItems([]);
  
      
      setModalVisible(false);
  
      
      if (updatedFavorites.length === 0) {
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };
  

  // Render delete button for swipe
  const renderDeleteButton = (itemId: string) => (
    <TouchableOpacity onPress={() => deleteItem(itemId)} style={styles.deleteButton}>
      <AntDesign name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  // Render each art tool item with swipe and checkbox support
  const renderArtTool = ({ item }: { item: ArtTool }) => (
    <Swipeable
      renderRightActions={() => renderDeleteButton(item.id)}
      friction={2}
      overshootRight={false}
    >
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {editMode && (
            <TouchableOpacity onPress={() => toggleSelectItem(item.id)} style={styles.checkboxContainer}>
              <AntDesign name={selectedItems.includes(item.id) ? 'checksquare' : 'checksquareo'} size={24} color="black" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Detail', { id: item.id })} style={styles.infoContainer}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            <View style={styles.info}>
              <Text style={styles.artName}>{item.artName}</Text>
              <Text style={styles.price}>${item.price}</Text>
              {item.limitedTimeDeal > 0 && <Text style={styles.deal}>-{item.limitedTimeDeal}%</Text>}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      {editMode && (
        <View style={styles.editControls}>
          <Button
            title={selectedItems.length === favoriteArtTools.length ? 'Uncheck All' : 'Check All'}
            onPress={selectAllItems}
          />
          <Button
            title="Delete Selected"
            onPress={() => setModalVisible(true)}
            disabled={selectedItems.length === 0}
          />
        </View>
      )}
      {favoriteArtTools.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AntDesign name="frowno" size={64} color="gray" />
          <Text style={styles.emptyText}>No favorites yet!</Text>
          <Text style={styles.emptySubText}>Add your favorite art tools to see them here.</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteArtTools}
          keyExtractor={(item) => item.id}
          renderItem={renderArtTool}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Are you sure you want to delete the selected items?</Text>
            <Button title="Yes, Delete" onPress={deleteSelectedItems} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerButton: { marginRight: 15 },
  headerButtonText: { color: '#007BFF', fontSize: 16 },
  card: { marginVertical: 8, backgroundColor: '#f8f8f8' },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  infoContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  info: { flex: 1 },
  artName: { fontSize: 16, fontWeight: 'bold' },
  price: { fontSize: 14, color: '#888' },
  deal: { fontSize: 12, color: 'red', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, color: 'gray' },
  emptySubText: { fontSize: 16, color: 'gray', textAlign: 'center', paddingHorizontal: 30 },
  checkboxContainer: { padding: 10 },
  editControls: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 },
  deleteButton: { backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', width: 80, height: '100%' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: 300, padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  modalText: { fontSize: 16, marginBottom: 20 },
});

export default FavoritesScreen;
