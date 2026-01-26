// navigation/AdminTabNavigator.tsx - Bottom tabs for admin
import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Admin Screens
import AdminDashboardScreen from "@/screens/admin/AdminDashboardScreen";
import AdminUsersScreen from "@/screens/admin/AdminUsersScreen";
import AdminRecipesScreen from "@/screens/admin/AdminRecipesScreen";
import RecipeDetailScreen from "@/screens/RecipeDetailScreen";
import ProfileScreen from "@/screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator for Dashboard tab
const DashboardStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false, // Hide the Stack Navigator header
        }}
    >
        <Stack.Screen name="AdminDashboardMain" component={AdminDashboardScreen} />
    </Stack.Navigator>
);

// Stack navigator for Users tab
const UsersStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false, // Hide the Stack Navigator header
        }}
    >
        <Stack.Screen name="AdminUsersMain" component={AdminUsersScreen} />
    </Stack.Navigator>
);

// Stack navigator for Recipes tab
const RecipesStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false, // Hide the Stack Navigator header
        }}
    >
        <Stack.Screen name="AdminRecipesMain" component={AdminRecipesScreen} />
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

const AdminTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#dc2626",
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
                name="AdminDashboard"
                component={DashboardStack}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="AdminUsers"
                component={UsersStack}
                options={{
                    tabBarLabel: "Users",
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👥</Text>,
                }}
            />
            <Tab.Screen
                name="AdminRecipes"
                component={RecipesStack}
                options={{
                    tabBarLabel: "Recipes",
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📚</Text>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
                    tabBarLabel: "Profile",
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
                }}
            />
        </Tab.Navigator>
    );
};

export default AdminTabNavigator;
