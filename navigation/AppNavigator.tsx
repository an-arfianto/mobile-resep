import { useAuth } from "@/context/AuthContext";
import AdminTabNavigator from "@/navigation/AdminTabNavigator";
import ModeratorTabNavigator from "@/navigation/ModeratorTabNavigator";
import UserTabNavigator from "@/navigation/UserTabNavigator";
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const isAdmin = user?.role_id === 1;
    const isModerator = user?.role_id === 2;

    if (!isAuthenticated) {
        return (
            <Stack.Navigator>
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        );
    }

    // admin navigation
    if (isAdmin) {
        return <AdminTabNavigator />;
    }

    // moderator navigation
    if (isModerator) {
        return <ModeratorTabNavigator />;
    }

    // regular user navigation
    return <UserTabNavigator />;
};

export default AppNavigator;
