// navigation/AppNavigator.tsx - Main app navigator (REPLACE OLD FILE)
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";

// Auth Screens
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";

// Tab Navigators
import UserTabNavigator from "@/navigation/UserTabNavigator";
import AdminTabNavigator from "@/navigation/AdminTabNavigator";
import ModeratorTabNavigator from "@/navigation/ModeratorTabNavigator";

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const isAdmin = user?.role_id === 1;
    const isModerator = user?.role_id === 2;

    // Without authentication - show login/register
    if (!isAuthenticated) {
        return (
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: "#ef4444" },
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" },
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        );
    }

    // Admin navigation
    if (isAdmin) {
        return <AdminTabNavigator />;
    }

    // Moderator navigation
    if (isModerator) {
        return <ModeratorTabNavigator />;
    }

    // Regular user navigation
    return <UserTabNavigator />;
};

export default AppNavigator;
