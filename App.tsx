import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import DetailScreen from './src/screens/DetailScreen';
import { FavoriteProvider } from './src/context/FavoriteContext';
import { MenuProvider } from 'react-native-popup-menu';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type IoniconName = keyof typeof Ionicons.glyphMap;

// Bottom Tab Navigator
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IoniconName = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView>
      <FavoriteProvider>
        <MenuProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
              <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detail' }} />
            </Stack.Navigator>
          </NavigationContainer>
          <Toast />
        </MenuProvider>
    </FavoriteProvider>
    </GestureHandlerRootView>  
  );
}
