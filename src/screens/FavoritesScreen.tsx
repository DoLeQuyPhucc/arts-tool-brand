import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Modal, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { AntDesign } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
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
  const [showDeleteIcon, setShowDeleteIcon] = useState<string | null>(null);
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
    }, [])
  );

  // Delete a single item by swipe
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

  // Delete selected items
  const deleteSelectedItems = async () => {
    try {
      // Toggle favorite for each selected item
      selectedItems.forEach((itemId) => {
        toggleFavorite(itemId);
      });
  
      // Update the favoriteArtTools list
      const updatedFavorites = favoriteArtTools.filter((tool) => !selectedItems.includes(tool.id));
      setFavoriteArtTools(updatedFavorites);
  
      // Save the updated list to AsyncStorage
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites.map((tool) => tool.id)));
  
      // Clear the selected items and close the modal
      setSelectedItems([]);
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  // Render each art tool item with swipe and checkbox support
  const renderArtTool = ({ item }: { item: ArtTool }) => (
    <GestureRecognizer
      onSwipeLeft={() => setShowDeleteIcon(item.id)}
      onSwipeRight={() => setShowDeleteIcon(null)}
      style={styles.card}
    >
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
        {/* Show the trash icon when the user swipes left */}
        {showDeleteIcon === item.id && (
          <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteIcon}>
            <AntDesign name="delete" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
    </GestureRecognizer>
  );

  return (
    <View style={styles.container}>
      <Button title={editMode ? 'Cancel' : 'Edit'} onPress={() => setEditMode(!editMode)} />
      {editMode && (
        <Button
          title="Delete Selected"
          onPress={() => setModalVisible(true)}
          disabled={selectedItems.length === 0}
        />
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

      {/* Modal for deleting selected items */}
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
  deleteIcon: { paddingHorizontal: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalView: { backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalText: { marginBottom: 15, textAlign: 'center' },
});

export default FavoritesScreen;
