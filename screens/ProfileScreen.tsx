import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import api from "@/services/api";

const ProfileScreen: React.FC = () => {
    const { logout } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"info" | "settings">("info");

    const [editingUsername, setEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [usernameLoading, setUsernameLoading] = useState(false);

    const [editingPassword, setEditingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.profile.getProfile();
            setProfile(response.data);
            setNewUsername(response.data.username);
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError(err.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, []),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchProfile();
        setRefreshing(false);
    }, []);

    const handleLogout = () => {
        Alert.alert(
            "Keluar",
            "Anda yakin ingin keluar?",
            [
                {
                    text: "Batal",
                    style: "cancel",
                },
                {
                    text: "Keluar",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                    },
                },
            ],
            { cancelable: true },
        );
    };

    const handleUpdateUsername = async () => {
        if (!newUsername || newUsername.trim().length < 3) {
            Alert.alert("Eror", "Username minimal 3 huruf");
            return;
        }

        Alert.alert("Update Username", `Ganti username ke "${newUsername}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Update",
                onPress: async () => {
                    try {
                        setUsernameLoading(true);
                        await api.profile.updateProfile(newUsername.trim());
                        Alert.alert("Success", "Username telah diubah!");
                        await fetchProfile();
                        setEditingUsername(false);
                    } catch (err: any) {
                        Alert.alert("Error", err.message || "Username gagal diubah");
                    } finally {
                        setUsernameLoading(false);
                    }
                },
            },
        ]);
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword) {
            Alert.alert("Error", "Isi semua kolom password yang tersedia");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords tidak cocok");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password minimal 6 huruf");
            return;
        }

        try {
            setPasswordLoading(true);
            await api.profile.updatePassword(currentPassword, newPassword);
            Alert.alert("Success", "Password telah diubah");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setEditingPassword(false);
        } catch (err: any) {
            Alert.alert("Error", err.message || "Password gagal diubah");
        } finally {
            setPasswordLoading(false);
        }
    };

    const getRoleBadge = () => {
        if (profile?.role_id === 1) {
            return { label: "Admin", bg: "#fee2e2", text: "#b91c1c" };
        }
        if (profile?.role_id === 2) {
            return { label: "Moderator", bg: "#f3e8ff", text: "#7c3ead" };
        }
        return { label: "User", bg: "#dbeafe", text: "#1e40af" };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <Header title="My Profile" />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#00796b" />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header title="Profil Saya" />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
                        <Text style={styles.retryButtonText}>Coba lagi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const roleBadge = getRoleBadge();

    return (
        <View style={styles.container}>
            <Header title="Profil Saya" />

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "info" && styles.tabActive]}
                    onPress={() => setActiveTab("info")}
                >
                    <Text style={[styles.tabText, activeTab === "info" && styles.tabTextActive]}>
                        Info Profil
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "settings" && styles.tabActive]}
                    onPress={() => setActiveTab("settings")}
                >
                    <Text
                        style={[styles.tabText, activeTab === "settings" && styles.tabTextActive]}
                    >
                        Pengaturan Akun
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#ef4444"]}
                        tintColor="#ef4444"
                    />
                }
            >
                {activeTab === "info" && (
                    <>
                        <View style={styles.profileHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {profile?.username?.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.username}>{profile?.username}</Text>
                            <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
                                <Text style={[styles.roleBadgeText, { color: roleBadge.text }]}>
                                    {roleBadge.label}
                                </Text>
                            </View>
                            <Text style={styles.memberSince}>
                                Bergabung {formatDate(profile?.created_at)}
                            </Text>
                        </View>

                        <View style={styles.statsCard}>
                            <Text style={styles.sectionTitle}>Resep Statistik</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: "#3b82f6" }]}>
                                        {profile?.recipe_count || 0}
                                    </Text>
                                    <Text style={styles.statLabel}>Total</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: "#22c55e" }]}>
                                        {profile?.approved_count || 0}
                                    </Text>
                                    <Text style={styles.statLabel}>
                                        {profile?.role_id === 2
                                            ? "Saya Setujui"
                                            : "Telah Disetujui"}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: "#eab308" }]}>
                                        {profile?.pending_count || 0}
                                    </Text>
                                    <Text style={styles.statLabel}>Pending</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: "#ef4444" }]}>
                                        {profile?.rejected_count || 0}
                                    </Text>
                                    <Text style={styles.statLabel}>
                                        {profile?.role_id === 2 ? "Saya Tolak" : "Telah Ditolak"}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Logout Button in Profile Info Tab */}
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.logoutIcon}>🚪</Text>
                            <Text style={styles.logoutButtonText}>Keluar</Text>
                        </TouchableOpacity>
                    </>
                )}

                {activeTab === "settings" && (
                    <>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.sectionTitle}>Username</Text>
                                {!editingUsername && (
                                    <TouchableOpacity onPress={() => setEditingUsername(true)}>
                                        <Text style={styles.editButton}>Edit</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {editingUsername ? (
                                <View>
                                    <TextInput
                                        style={styles.input}
                                        value={newUsername}
                                        onChangeText={setNewUsername}
                                        placeholder="Masukan username baru"
                                        editable={!usernameLoading}
                                        autoCapitalize="none"
                                    />
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => {
                                                setNewUsername(profile?.username);
                                                setEditingUsername(false);
                                            }}
                                            disabled={usernameLoading}
                                        >
                                            <Text style={styles.cancelButtonText}>Batal</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.saveButton}
                                            onPress={handleUpdateUsername}
                                            disabled={usernameLoading}
                                        >
                                            {usernameLoading ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text style={styles.saveButtonText}>Simpan</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.currentValue}>{profile?.username}</Text>
                            )}
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.sectionTitle}>Password</Text>
                                {!editingPassword && (
                                    <TouchableOpacity onPress={() => setEditingPassword(true)}>
                                        <Text style={styles.editButton}>Edit</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {editingPassword ? (
                                <View>
                                    <TextInput
                                        style={styles.input}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        placeholder="Password anda sekarang"
                                        secureTextEntry
                                        editable={!passwordLoading}
                                        autoCapitalize="none"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        placeholder="Password baru"
                                        secureTextEntry
                                        editable={!passwordLoading}
                                        autoCapitalize="none"
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="Konfirmasi password baru"
                                        secureTextEntry
                                        editable={!passwordLoading}
                                        autoCapitalize="none"
                                    />
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => {
                                                setCurrentPassword("");
                                                setNewPassword("");
                                                setConfirmPassword("");
                                                setEditingPassword(false);
                                            }}
                                            disabled={passwordLoading}
                                        >
                                            <Text style={styles.cancelButtonText}>Batal</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.saveButton}
                                            onPress={handleUpdatePassword}
                                            disabled={passwordLoading}
                                        >
                                            {passwordLoading ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text style={styles.saveButtonText}>Simpan</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.currentValue}>••••••••</Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.logoutIcon}>🚪</Text>
                            <Text style={styles.logoutButtonText}>Keluar</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabActive: {
        borderBottomColor: "#00796b",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
    },
    tabTextActive: {
        color: "#00796b",
    },
    profileHeader: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#ef4444",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarText: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "bold",
    },
    username: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 8,
    },
    roleBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 8,
    },
    roleBadgeText: {
        fontSize: 13,
        fontWeight: "700",
    },
    memberSince: {
        fontSize: 13,
        color: "#6b7280",
    },
    statsCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-around",
        flexWrap: "wrap",
    },
    statItem: {
        alignItems: "center",
        width: "45%",
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#6b7280",
        textAlign: "center",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    editButton: {
        fontSize: 14,
        color: "#ef4444",
        fontWeight: "600",
    },
    currentValue: {
        fontSize: 16,
        color: "#374151",
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        marginBottom: 12,
        backgroundColor: "#fff",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#374151",
        fontWeight: "600",
        fontSize: 15,
    },
    saveButton: {
        flex: 1,
        backgroundColor: "#ef4444",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
    logoutButton: {
        backgroundColor: "#fee2e2",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#fecaca",
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoutIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    logoutButtonText: {
        color: "#dc2626",
        fontSize: 16,
        fontWeight: "700",
    },
    errorText: {
        color: "#dc2626",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#ef4444",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});

export default ProfileScreen;
