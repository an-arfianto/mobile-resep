import { AuthProvider } from "@/context/AuthContext";
import AppNavigator from "@/navigation/AppNavigator";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/assets/color";

export default function Index() {
    return (
        <AuthProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
                <StatusBar style="dark" />
                <AppNavigator />
            </SafeAreaView>
        </AuthProvider>
    );
}
