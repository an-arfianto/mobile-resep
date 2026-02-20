import { colors } from "@/assets/color";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
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

        Alert.alert("Ubah Username", `Ganti username ke "${newUsername}"?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Ubah",
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
            return { label: "Admin", bg: colors.errorSoft, text: colors.error };
        }
        if (profile?.role_id === 2) {
            return { label: "Moderator", bg: colors.secondarySoft, text: colors.secondary };
        }
        return { label: "User", bg: colors.primarySoft, text: colors.primary };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const isAdmin = profile?.role_id === 1;
    const isModerator = profile?.role_id === 2;
    const isRegularUser = profile?.role_id === 3;

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <Header title="My Profile" />
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

    const roleBadge = getRoleBadge();

    return (
        <View style={styles.container}>
            <Header title="Profil Saya" />

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "info" && styles.tabActive]}
                    onPress={() => setActiveTab("info")}
                >
                    <Text style={[styles.tabText, activeTab === "info" && styles.tabTextActive]}>Info Profil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "settings" && styles.tabActive]}
                    onPress={() => setActiveTab("settings")}
                >
                    <Text style={[styles.tabText, activeTab === "settings" && styles.tabTextActive]}>
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
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {activeTab === "info" && (
                    <>
                        {/* Profile Header */}
                        <View style={styles.profileHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{profile?.username?.charAt(0).toUpperCase()}</Text>
                            </View>
                            <Text style={styles.username}>{profile?.username}</Text>
                            <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
                                <Text style={[styles.roleBadgeText, { color: roleBadge.text }]}>{roleBadge.label}</Text>
                            </View>
                            <Text style={styles.memberSince}>Bergabung {formatDate(profile?.created_at)}</Text>
                        </View>

                        {/* Admin: No Stats (just profile info) */}
                        {isAdmin && (
                            <View style={styles.adminInfoCard}>
                                <Text style={styles.adminInfoText}>Anda adalah admin dengan akses penuh ke sistem</Text>
                            </View>
                        )}

                        {/* Moderator: Dual Stats */}
                        {isModerator && (
                            <>
                                {/* Moderation Activity Stats */}
                                <View style={styles.statsCard}>
                                    <Text style={styles.sectionTitle}>Aktivitas Moderasi</Text>
                                    <View style={styles.statsGrid}>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.primary }]}>
                                                {profile?.reviewed_count || 0}
                                            </Text>
                                            <Text style={styles.statLabel}>Total Review</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.success }]}>
                                                {profile?.approved_count || 0}
                                            </Text>
                                            <Text style={styles.statLabel}>Disetujui</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.error }]}>
                                                {profile?.rejected_count || 0}
                                            </Text>
                                            <Text style={styles.statLabel}>Ditolak</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.warning }]}>
                                                {profile?.pending_count || 0}
                                            </Text>
                                            <Text style={styles.statLabel}>Menunggu Review</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Personal Recipe Stats */}
                                <View style={styles.statsCard}>
                                    <Text style={styles.sectionTitle}>Resep Saya</Text>
                                    <View style={styles.statsGrid}>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.primary }]}>
                                                {profile?.my_recipe_count || 0}
                                            </Text>
                                            <Text style={styles.statLabel}>Total Resep</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.success }]}>
                                                {profile?.my_approved_count || 0}
                                            </Text>
                                            <Text style={styles.statLabel}>Disetujui</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.warning }]}>
                                                {profile?.my_pending_count || 0}
                                            </Text>
                                            <Text style={styles.statLabel}>Menunggu Review</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.error }]}>
                                                {profile?.my_rejected_count || 0}
                                            </Text>
                                            <Text style={styles.statLabel}>Ditolak</Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Regular User: Recipe Stats Only */}
                        {isRegularUser && (
                            <View style={styles.statsCard}>
                                <Text style={styles.sectionTitle}>Statistik Resep</Text>
                                <View style={styles.statsGrid}>
                                    <View style={styles.statItem}>
                                        <Text style={[styles.statValue, { color: colors.primary }]}>
                                            {profile?.recipe_count || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Total Resep</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={[styles.statValue, { color: colors.success }]}>
                                            {profile?.approved_count || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Disetujui</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={[styles.statValue, { color: colors.warning }]}>
                                            {profile?.pending_count || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Pending</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={[styles.statValue, { color: colors.error }]}>
                                            {profile?.rejected_count || 0}
                                        </Text>
                                        <Text style={styles.statLabel}>Ditolak</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </>
                )}

                {activeTab === "settings" && (
                    <>
                        {/* Username Section */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.sectionTitle}>Username</Text>
                                {!editingUsername && (
                                    <TouchableOpacity onPress={() => setEditingUsername(true)}>
                                        <Text style={styles.editButton}>Ubah</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {editingUsername ? (
                                <View>
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
                                                setNewUsername(profile?.username);
                                            }}
                                        >
                                            <Text style={styles.cancelButtonText}>Batal</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.saveButton}
                                            onPress={handleUpdateUsername}
                                            disabled={usernameLoading}
                                        >
                                            {usernameLoading ? (
                                                <ActivityIndicator color={colors.textInverse} />
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

                        {/* Password Section */}
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
                                <View>
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
                                            style={styles.saveButton}
                                            onPress={handleUpdatePassword}
                                            disabled={passwordLoading}
                                        >
                                            {passwordLoading ? (
                                                <ActivityIndicator color={colors.textInverse} />
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

                        {/* Logout Button */}
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
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
        backgroundColor: colors.error,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButtonText: {
        color: colors.textInverse,
        fontWeight: "600",
        fontSize: 15,
    },
    saveButton: {
        flex: 1,
        backgroundColor: colors.success,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    saveButtonText: {
        color: colors.textInverse,
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
