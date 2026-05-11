import { colors } from "@/assets/color";
import Header from "@/components/Header";
import { useAuthStore } from "@/stores/authStore";
import api from "@/services/api";
import { formatDate } from "@/utils/recipe";
import type { ProfileData } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const roleBadges: Record<number, { label: string; bg: string; text: string }> = {
    1: { label: "Admin", bg: colors.errorSoft, text: colors.error },
    2: { label: "User", bg: colors.primarySoft, text: colors.primary },
};

const ProfileScreen: React.FC = () => {
    const { logout } = useAuthStore();

    const [profile, setProfile] = useState<ProfileData | null>(null);
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
        setLoading(true);
        setError(null);
        try {
            const response = await api.profile.getProfile();
            setProfile(response.data);
            setNewUsername(response.data.username);
        } catch (err: unknown) {
            const message =
                typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message: unknown }).message)
                    : "Gagal memuat profil";
            setError(message);
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
                { text: "Batal", style: "cancel" },
                { text: "Keluar", style: "destructive", onPress: logout },
            ],
            { cancelable: true },
        );
    };

    const handleUpdateUsername = () => {
        if (!newUsername.trim() || newUsername.trim().length < 3) {
            Alert.alert("Error", "Username minimal 3 huruf");
            return;
        }
        Alert.alert("Ubah Username", `Ganti username ke "${newUsername.trim()}"?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Ubah",
                onPress: async () => {
                    setUsernameLoading(true);
                    try {
                        await api.profile.updateProfile(newUsername.trim());
                        Alert.alert("Berhasil", "Username telah diubah!");
                        await fetchProfile();
                        setEditingUsername(false);
                    } catch (err: unknown) {
                        const message =
                            typeof err === "object" && err !== null && "message" in err
                                ? String((err as { message: unknown }).message)
                                : "Username gagal diubah";
                        Alert.alert("Error", message);
                    } finally {
                        setUsernameLoading(false);
                    }
                },
            },
        ]);
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Isi semua kolom password");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Password tidak cocok");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("Error", "Password minimal 6 huruf");
            return;
        }

        setPasswordLoading(true);
        try {
            await api.profile.updatePassword(currentPassword, newPassword);
            Alert.alert("Berhasil", "Password telah diubah!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setEditingPassword(false);
        } catch (err: unknown) {
            const message =
                typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message: unknown }).message)
                    : "Password gagal diubah";
            Alert.alert("Error", message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const roleBadge = roleBadges[profile?.role_id ?? 2] ?? roleBadges[2];

    const isAdmin = profile?.role_id === 1;
    const isRegularUser = profile?.role_id === 2;

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <Header title="Profil Saya" />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
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

    return (
        <View style={styles.container}>
            <Header title="Profil Saya" />

            <View style={styles.tabContainer}>
                {(["info", "settings"] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab === "info" ? "Info Profil" : "Pengaturan Akun"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
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
                                Bergabung{" "}
                                {profile?.created_at ? formatDate(profile.created_at) : "-"}
                            </Text>
                        </View>

                        {isAdmin && (
                            <View style={styles.adminInfoCard}>
                                <Text style={styles.adminInfoText}>
                                    Anda adalah admin dengan akses penuh ke sistem
                                </Text>
                            </View>
                        )}

                        {isRegularUser && (
                            <View style={styles.statsCard}>
                                <Text style={styles.sectionTitle}>Statistik Resep</Text>
                                <View style={styles.statsGrid2x2}>
                                    {[
                                        {
                                            label: "Total",
                                            value: profile?.recipe_count,
                                            color: colors.textPrimary,
                                        },
                                        {
                                            label: "Disetujui",
                                            value: profile?.approved_count,
                                            color: colors.success,
                                        },
                                        {
                                            label: "Ditolak",
                                            value: profile?.rejected_count,
                                            color: colors.error,
                                        },
                                        {
                                            label: "Pending",
                                            value: profile?.pending_count,
                                            color: colors.warning,
                                        },
                                    ].map(({ label, value, color }) => (
                                        <View key={label} style={styles.statItem2x2}>
                                            <Text style={[styles.statValue, { color }]}>
                                                {value || 0}
                                            </Text>
                                            <Text style={styles.statLabel}>{label}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </>
                )}

                {activeTab === "settings" && (
                    <>
                        {/* Username */}
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
                                <>
                                    <TextInput
                                        style={styles.input}
                                        value={newUsername}
                                        onChangeText={setNewUsername}
                                        placeholder="Username baru"
                                        placeholderTextColor={colors.textMuted}
                                        autoCapitalize="none"
                                    />
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => {
                                                setEditingUsername(false);
                                                setNewUsername(profile?.username ?? "");
                                            }}
                                        >
                                            <Text style={styles.cancelButtonText}>Batal</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.saveButton,
                                                usernameLoading && { opacity: 0.6 },
                                            ]}
                                            onPress={handleUpdateUsername}
                                            disabled={usernameLoading}
                                        >
                                            <Text style={styles.saveButtonText}>
                                                {usernameLoading ? "Menyimpan..." : "Simpan"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <Text style={styles.currentValue}>{profile?.username}</Text>
                            )}
                        </View>

                        {/* Password */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.sectionTitle}>Password</Text>
                                {!editingPassword && (
                                    <TouchableOpacity onPress={() => setEditingPassword(true)}>
                                        <Text style={styles.editButton}>Ubah</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {editingPassword ? (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                        placeholder="Password sekarang"
                                        placeholderTextColor={colors.textMuted}
                                        secureTextEntry
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        placeholder="Password baru"
                                        placeholderTextColor={colors.textMuted}
                                        secureTextEntry
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="Konfirmasi password baru"
                                        placeholderTextColor={colors.textMuted}
                                        secureTextEntry
                                    />
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => {
                                                setEditingPassword(false);
                                                setCurrentPassword("");
                                                setNewPassword("");
                                                setConfirmPassword("");
                                            }}
                                        >
                                            <Text style={styles.cancelButtonText}>Batal</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.saveButton,
                                                passwordLoading && { opacity: 0.6 },
                                            ]}
                                            onPress={handleUpdatePassword}
                                            disabled={passwordLoading}
                                        >
                                            <Text style={styles.saveButtonText}>
                                                {passwordLoading ? "Menyimpan..." : "Simpan"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <Text style={styles.currentValue}>••••••••</Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            activeOpacity={0.8}
                        >
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
        backgroundColor: colors.background,
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
        backgroundColor: colors.background,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabActive: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textMuted,
    },
    tabTextActive: {
        color: colors.primary,
    },
    profileHeader: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarText: {
        color: colors.textInverse,
        fontSize: 36,
        fontWeight: "bold",
    },
    username: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textPrimary,
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
        color: colors.textMuted,
    },
    adminInfoCard: {
        backgroundColor: colors.warningSoft,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    adminInfoText: {
        fontSize: 14,
        color: colors.warning,
        textAlign: "center",
        fontWeight: "600",
    },
    statsCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-around",
        flexWrap: "wrap",
    },
    statItem: {
        alignItems: "center",
        width: "33%",
        marginBottom: 12,
    },
    statsGrid2x2: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    statItem2x2: {
        alignItems: "center",
        width: "50%",
        marginBottom: 16,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: "center",
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
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
        color: colors.primary,
        fontWeight: "600",
    },
    currentValue: {
        fontSize: 16,
        color: colors.textMuted,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        marginBottom: 12,
        backgroundColor: colors.overlay,
        color: colors.textPrimary,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.errorSoft,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButtonText: {
        color: colors.error,
        fontWeight: "600",
        fontSize: 15,
    },
    saveButton: {
        flex: 1,
        backgroundColor: colors.successSoft,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    saveButtonText: {
        color: colors.success,
        fontWeight: "600",
        fontSize: 15,
    },
    logoutButton: {
        backgroundColor: colors.error,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    logoutButtonText: {
        color: colors.textInverse,
        fontSize: 16,
        fontWeight: "700",
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: colors.error,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.textInverse,
        fontWeight: "600",
        fontSize: 16,
    },
});

export default ProfileScreen;
