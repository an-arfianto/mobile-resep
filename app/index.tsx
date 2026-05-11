import { colors } from "@/assets/color";
import AppNavigator from "@/navigation/AppNavigator";
import { useAuthStore } from "@/stores/authStore";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
            <StatusBar style="dark" />
            <AppNavigator />
        </SafeAreaView>
    );
}
