import { colors } from "@/assets/color";
import api from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { AdminStats, RootStackParamList } from "@/types";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AdminDashboardScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuthStore();

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.admin.getStats();
            setStats(response.data);
        } catch (err: unknown) {
            const message =
                typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message: unknown }).message)
                    : "Gagal memuat statistik";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, []),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchStats}>
                        <Text style={styles.retryButtonText}>Coba lagi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Selamat datang, {user?.username}!</Text>
                    <Text style={styles.welcomeSubtext}>Admin Dashboard</Text>
                </View>

                <View style={styles.mainStatsContainer}>
                    <View style={styles.statsRow}>
                        {[
                            { icon: "users", value: stats?.totalUsers, label: "Total Users" },
                            { icon: "book-open", value: stats?.totalRecipes, label: "Total Resep" },
                        ].map(({ icon, value, label }) => (
                            <View key={label} style={styles.statCard}>
                                <Feather name={icon as any} size={28} color={colors.primary} />
                                <Text style={styles.statValue}>{value ?? 0}</Text>
                                <Text style={styles.statLabel}>{label}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.statsRow}>
                        {[
                            { icon: "clock", value: stats?.pendingRecipes, label: "Pending" },
                            {
                                icon: "check-circle",
                                value: stats?.recipesByStatus?.approved,
                                label: "Disetujui",
                            },
                        ].map(({ icon, value, label }) => (
                            <View key={label} style={styles.statCard}>
                                <Feather name={icon as any} size={28} color={colors.primary} />
                                <Text style={styles.statValue}>{value ?? 0}</Text>
                                <Text style={styles.statLabel}>{label}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.statsRow}>
                        {[
                            { icon: "user-x", value: stats?.suspendedUsers, label: "Disuspend" },
                            {
                                icon: "x-circle",
                                value: stats?.recipesByStatus?.rejected,
                                label: "Ditolak",
                            },
                        ].map(({ icon, value, label }) => (
                            <View key={label} style={styles.statCard}>
                                <Feather name={icon as any} size={28} color={colors.primary} />
                                <Text style={styles.statValue}>{value ?? 0}</Text>
                                <Text style={styles.statLabel}>{label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu Cepat</Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.actionCard, styles.actionCardHalf]}
                            onPress={() => navigation.navigate("AdminUsers")}
                        >
                            <View style={styles.actionIcon}>
                                <Feather name="users" size={28} color={colors.primary} />
                            </View>
                            <Text style={styles.actionTitle}>Kelola User</Text>
                            <Text style={styles.actionDesc}>{stats?.totalUsers ?? 0} users</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, styles.actionCardHalf]}
                            onPress={() => navigation.navigate("AdminRecipes")}
                        >
                            <View style={styles.actionIcon}>
                                <Feather name="book-open" size={28} color={colors.primary} />
                            </View>
                            <Text style={styles.actionTitle}>Kelola Resep</Text>
                            <Text style={styles.actionDesc}>{stats?.totalRecipes ?? 0} resep</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    welcomeSection: {
        backgroundColor: colors.surface,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    welcomeSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    mainStatsContainer: {
        padding: 16,
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 100,
        backgroundColor: colors.surface,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        gap: 8,
    },
    statValue: {
        fontSize: 36,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
        textTransform: "uppercase",
        textAlign: "center",
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 12,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
    },
    actionCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    actionCardHalf: {
        flex: 1,
        alignItems: "center",
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.overlay,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 4,
        textAlign: "center",
    },
    actionDesc: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: "center",
    },
    categoriesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    categoryCard: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    categoryCount: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    categoryName: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
        textAlign: "center",
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

export default AdminDashboardScreen;
