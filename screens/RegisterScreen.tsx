import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";
import type { RootStackParamList } from "@/types";

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
            role_id: 2, // Default user
        });

        if (success) {
            navigation.navigate("Home");
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.title}>Register</Text>

                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Isi username anda"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="isi minimal 6 karakter"
                        placeholderTextColor="#999"
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Konfirmasi Password</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="isi ulang password anda "
                        placeholderTextColor="#999"
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? "Mohon Tunggu..." : "Register"}
                        </Text>
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
        backgroundColor: "#f9fafb",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#111",
        textAlign: "center",
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 16,
        color: "#111",
    },
    errorContainer: {
        backgroundColor: "#fee2e2",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: "#dc2626",
        fontSize: 14,
    },
    button: {
        backgroundColor: "#ef4444",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
    },
    footerText: {
        color: "#6b7280",
        fontSize: 14,
    },
    link: {
        color: "#ef4444",
        fontWeight: "600",
        fontSize: 14,
    },
});

export default RegisterScreen;
