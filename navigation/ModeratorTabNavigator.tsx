// navigation/ModeratorTabNavigator.tsx - Bottom tabs for moderator
import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Moderator Screens
import ModerationDashboardScreen from "@/screens/moderation/ModerationDashboardScreen";
import ModerationPendingScreen from "@/screens/moderation/ModerationPendingScreen";
import ModerationReviewedScreen from "@/screens/moderation/ModerationReviewedScreen";
import ModerationAllScreen from "@/screens/moderation/ModerationAllScreen";
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
        <Stack.Screen name="ModerationDashboardMain" component={ModerationDashboardScreen} />
        <Stack.Screen name="ModerationAll" component={ModerationAllScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
);

// Stack navigator for Pending tab
const PendingStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false, // Hide the Stack Navigator header
        }}
    >
        <Stack.Screen name="ModerationPendingMain" component={ModerationPendingScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
);

// Stack navigator for Reviewed tab
const ReviewedStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false, // Hide the Stack Navigator header
        }}
    >
        <Stack.Screen name="ModerationReviewedMain" component={ModerationReviewedScreen} />
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

const ModeratorTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#3b82f6",
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
                name="ModerationDashboard"
                component={DashboardStack}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="ModerationPending"
                component={PendingStack}
                options={{
                    tabBarLabel: "Pending",
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⏳</Text>,
                }}
            />
            <Tab.Screen
                name="ModerationReviewed"
                component={ReviewedStack}
                options={{
                    tabBarLabel: "Reviewed",
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>,
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

export default ModeratorTabNavigator;
