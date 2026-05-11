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

import ModeratorAllScreen from "@/screens/moderator/ModeratorAllScreen";
import ModeratorDashboardScreen from "@/screens/moderator/ModeratorDashboardScreen";
import ModeratorPendingScreen from "@/screens/moderator/ModeratorPendingScreen";
import ModeratorReviewedScreen from "@/screens/moderator/ModeratorReviewedScreen";
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

const ModeratorStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ModeratorDashboardMain" component={ModeratorDashboardScreen} />
        <Stack.Screen name="ModeratorPending" component={ModeratorPendingScreen} />
        <Stack.Screen name="ModeratorReviewed" component={ModeratorReviewedScreen} />
        <Stack.Screen name="ModeratorAll" component={ModeratorAllScreen} />
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
                    height: 70,
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
                name="ModeratorDashboard"
                component={ModeratorStack}
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
