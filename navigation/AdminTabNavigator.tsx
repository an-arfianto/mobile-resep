import { colors } from "@/assets/color";
import Feather from "@expo/vector-icons/Feather";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import AdminDashboardScreen from "@/screens/admin/AdminDashboardScreen";
import AdminRecipesScreen from "@/screens/admin/AdminRecipesScreen";
import AdminUsersScreen from "@/screens/admin/AdminUsersScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import RecipeDetailScreen from "@/screens/RecipeDetailScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminDashboardMain" component={AdminDashboardScreen} />
    </Stack.Navigator>
);

const UsersStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminUsersMain" component={AdminUsersScreen} />
    </Stack.Navigator>
);

const RecipesStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminRecipesMain" component={AdminRecipesScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
);

const ProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
);

const AdminTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textPrimary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: colors.divider,
                    paddingTop: 10,
                    paddingBottom: 10,
                    height: 80,
                },
            }}
        >
            <Tab.Screen
                name="AdminDashboard"
                component={DashboardStack}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
                }}
            />
            <Tab.Screen
                name="AdminUsers"
                component={UsersStack}
                options={{
                    tabBarLabel: "User",
                    tabBarIcon: ({ color }) => <Feather name="users" size={24} color={color} />,
                }}
            />
            <Tab.Screen
                name="AdminRecipes"
                component={RecipesStack}
                options={{
                    tabBarLabel: "Resep",
                    tabBarIcon: ({ color }) => <Feather name="book" size={24} color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
                    tabBarLabel: "Profil",
                    tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default AdminTabNavigator;
