import { AuthProvider } from "@/context/AuthContext";
import AppNavigator from "@/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    return (
        <AuthProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar style="auto" />
                <AppNavigator />
            </SafeAreaView>
        </AuthProvider>
    );
}
