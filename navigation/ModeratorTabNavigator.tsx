import { colors } from "@/assets/color";
import Feather from "@expo/vector-icons/Feather";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import CreateRecipeScreen from "@/screens/CreateRecipeScreen";
import EditRecipeScreen from "@/screens/EditRecipeScreen";
import HomeScreen from "@/screens/HomeScreen";
import MyRecipesScreen from "@/screens/MyRecipesScreen";
import RecipeDetailScreen from "@/screens/RecipeDetailScreen";
import SearchScreen from "@/screens/SearchScreen";

import ModerationAllScreen from "@/screens/moderation/ModerationAllScreen";
import ModerationDashboardScreen from "@/screens/moderation/ModerationDashboardScreen";
import ModerationPendingScreen from "@/screens/moderation/ModerationPendingScreen";
import ModerationReviewedScreen from "@/screens/moderation/ModerationReviewedScreen";
import ProfileScreen from "@/screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeMain" component={HomeScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
);

const SearchStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SearchMain" component={SearchScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
);

const MyRecipesStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MyRecipesMain" component={MyRecipesScreen} />
        <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} />
        <Stack.Screen name="EditRecipe" component={EditRecipeScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
);

const ModerationStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ModerationDashboardMain" component={ModerationDashboardScreen} />
        <Stack.Screen name="ModerationPending" component={ModerationPendingScreen} />
        <Stack.Screen name="ModerationReviewed" component={ModerationReviewedScreen} />
        <Stack.Screen name="ModerationAll" component={ModerationAllScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
);

const ProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
);

const ModeratorTabNavigator: React.FC = () => {
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
                name="Home"
                component={HomeStack}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchStack}
                options={{
                    tabBarLabel: "Cari",
                    tabBarIcon: ({ color }) => <Feather name="search" size={22} color={color} />,
                }}
            />
            <Tab.Screen
                name="MyRecipes"
                component={MyRecipesStack}
                options={{
                    tabBarLabel: "Resep Saya",
                    tabBarIcon: ({ color }) => <Feather name="book" size={22} color={color} />,
                }}
            />
            <Tab.Screen
                name="ModerationDashboard"
                component={ModerationStack}
                options={{
                    tabBarLabel: "Moderasi",
                    tabBarIcon: ({ color }) => <Feather name="shield" size={22} color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
                    tabBarLabel: "Profil",
                    tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default ModeratorTabNavigator;
