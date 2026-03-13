import { colors } from "@/assets/color";
import Header from "@/components/Header";
import api from "@/services/api";
import type { ModerationStats, RootStackParamList } from "@/types";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ModerationDashboardScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [stats, setStats] = useState<ModerationStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.moderation.getStats();
            setStats(response.data);
        } catch (err: any) {
            if (err.cancelled) return;
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            const controller = new AbortController();
            fetchStats();
            return () => controller.abort();
        }, []),
    );

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
            <Header title="Moderator Dashboard" />
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
                <View style={styles.mainStatsContainer}>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Feather name="bar-chart-2" size={32} color={colors.primary} />
                            <Text style={styles.statValue}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total Resep</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Feather name="clock" size={32} color={colors.primary} />
                            <Text style={styles.statValue}>{stats.pending}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Feather name="check-circle" size={32} color={colors.primary} />
                            <Text style={styles.statValue}>{stats.approved}</Text>
                            <Text style={styles.statLabel}>Disetujui</Text>
                        </View>

                        <View style={styles.statCard}>
                            <Feather name="x-circle" size={32} color={colors.primary} />
                            <Text style={styles.statValue}>{stats.rejected}</Text>
                            <Text style={styles.statLabel}>Ditolak</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu Cepat</Text>

                    <TouchableOpacity
                        style={[styles.actionCard, styles.primaryAction]}
                        onPress={() => navigation.navigate("ModerationPending")}
                    >
                        <View style={styles.actionIconContainer}>
                            <Feather name="edit-3" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Review Pending</Text>
                            <Text style={styles.actionDesc}>Review resep yang perlu disetujui</Text>
                        </View>
                        {stats.pending > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{stats.pending}</Text>
                            </View>
                        )}
                        <Feather name="chevron-right" size={24} color={colors.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.actionCard, styles.actionCardHalf]}
                            onPress={() => navigation.navigate("ModerationReviewed")}
                        >
                            <View style={[styles.actionIconContainer, styles.iconContainerSmall]}>
                                <Feather name="file-text" size={28} color={colors.primary} />
                            </View>
                            <Text style={styles.actionTitleSmall}>Review Saya</Text>
                            <Text style={styles.actionDescSmall}>Resep yang telah direview</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, styles.actionCardHalf]}
                            onPress={() => navigation.navigate("ModerationAll")}
                        >
                            <View style={[styles.actionIconContainer, styles.iconContainerSmall]}>
                                <Feather name="book-open" size={28} color={colors.primary} />
                            </View>
                            <Text style={styles.actionTitleSmall}>Semua Resep</Text>
                            <Text style={styles.actionDescSmall}>Lihat semua resep</Text>
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
        backgroundColor: colors.surface,
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
        minHeight: 120,
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
    primaryAction: {
        marginBottom: 12,
    },
    actionCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.overlay,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: 2,
    },
    actionDesc: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    badge: {
        backgroundColor: colors.error,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 8,
    },
    badgeText: {
        color: colors.textInverse,
        fontSize: 12,
        fontWeight: "bold",
    },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
    },
    actionCardHalf: {
        flex: 1,
        flexDirection: "column",
        padding: 16,
    },
    iconContainerSmall: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginBottom: 12,
        alignSelf: "center",
    },
    actionTitleSmall: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: 4,
        textAlign: "center",
    },
    actionDescSmall: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: "center",
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
        paddingHorizontal: 20,
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

export default ModerationDashboardScreen;
