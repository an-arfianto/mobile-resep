// navigation/UserTabNavigator.tsx - Bottom tabs for regular users
import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// User Screens
import HomeScreen from "@/screens/HomeScreen";
import SearchScreen from "@/screens/SearchScreen";
import RecipeDetailScreen from "@/screens/RecipeDetailScreen";
import MyRecipesScreen from "@/screens/MyRecipesScreen";
import CreateRecipeScreen from "@/screens/CreateRecipeScreen";
import EditRecipeScreen from "@/screens/EditRecipeScreen";
import ProfileScreen from "@/screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator for Home tab (includes detail screens)
const HomeStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false, // Hide the Stack Navigator header
        }}
    >
        <Stack.Screen name="HomeMain" component={HomeScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
);

// Stack navigator for Search tab
const SearchStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false, // Hide the Stack Navigator header
        }}
    >
        <Stack.Screen name="SearchMain" component={SearchScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
);

// Stack navigator for My Recipes tab
const MyRecipesStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false, // Hide the Stack Navigator header
        }}
    >
        <Stack.Screen name="MyRecipesMain" component={MyRecipesScreen} />
        <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} />
        <Stack.Screen name="EditRecipe" component={EditRecipeScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
);

// Stack navigator for Profile tab
const ProfileStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false, // Hide the Stack Navigator header
        }}
    >
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
);

const UserTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#ef4444",
                tabBarInactiveTintColor: "#6b7280",
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: "#e5e7eb",
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 60,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchStack}
                options={{
                    tabBarLabel: "Cari",
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🔍</Text>,
                }}
            />
            <Tab.Screen
                name="MyRecipes"
                component={MyRecipesStack}
                options={{
                    tabBarLabel: "Resep Saya",
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📖</Text>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
                    tabBarLabel: "Profil",
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
                }}
            />
        </Tab.Navigator>
    );
};

export default UserTabNavigator;
