import { colors } from "@/assets/color";
import { useAuth } from "@/context/AuthContext";
import type { RootStackParamList } from "@/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { register, loading, error } = useAuth();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) {
            alert("Isi semua field yang ada!");
            return;
        }

        if (password.length < 6) {
            alert("Password harus berisi minimal 6 karakter");
            return;
        }

        if (password !== confirmPassword) {
            alert("Password tidak cocok");
            return;
        }

        const success = await register({
            username,
            password,
            role_id: 3,
        });

        if (success) {
            navigation.navigate("Home");
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.title}>Register</Text>

                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Masukan username anda"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Masukan password minimal 6 karakter"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Konfirmasi Password</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Masukan ulang password anda "
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? "Mohon Tunggu..." : "Register"}</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Sudah memiliki akun? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.link}>Login!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 16,
    },
    card: {
        backgroundColor: colors.surface,
        padding: 24,
        borderRadius: 12,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 16,
        backgroundColor: colors.inputBackground,
        color: colors.textPrimary,
    },
    errorContainer: {
        backgroundColor: colors.errorSoft,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: colors.textInverse,
        fontWeight: "bold",
        fontSize: 16,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
    },
    footerText: {
        color: colors.textPrimary,
        fontSize: 14,
    },
    link: {
        color: colors.primary,
        fontWeight: "600",
        fontSize: 14,
    },
});

export default RegisterScreen;
