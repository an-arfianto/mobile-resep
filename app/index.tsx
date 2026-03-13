import { colors } from "@/assets/color";
import { AuthProvider } from "@/context/AuthContext";
import AppNavigator from "@/navigation/AppNavigator";
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    return (
        <AuthProvider>
            <StatusBar backgroundColor={colors.background} barStyle="dark-content" translucent={false} />
            <SafeAreaView style={{ flex: 1 }}>
                <AppNavigator />
            </SafeAreaView>
        </AuthProvider>
    );
}
