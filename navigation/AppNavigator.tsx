import { useAuthStore } from "@/stores/authStore";
import AdminTabNavigator from "@/navigation/AdminTabNavigator";
import UserTabNavigator from "@/navigation/UserTabNavigator";
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuthStore();

    if (!isAuthenticated) {
        return (
            <Stack.Navigator>
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

    if (isAdmin) return <AdminTabNavigator />;
    return <UserTabNavigator />;
};

export default AppNavigator;
