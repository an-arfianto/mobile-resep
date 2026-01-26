import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, ModerationStats } from "@/types";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ModerationDashboardScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [stats, setStats] = useState<ModerationStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });
    const { user } = useAuth();
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
            fetchStats();
        }, []),
    );

    const StatCard = ({ title, value, color, icon }: any) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </View>
    );

    const MenuButton = ({ title, subtitle, onPress, icon, badge }: any) => (
        <TouchableOpacity style={styles.menuButton} onPress={onPress}>
            <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{icon}</Text>
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSubtitle}>{subtitle}</Text>
            </View>
            {badge > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            )}
            <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchStats}>
                    <Text style={styles.retryButtonText}>Coba lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#ef4444"]}
                    tintColor="#ef4444"
                />
            }
        >
            <Header title="Moderator Dashboard" />
            <View style={styles.header}>
                <Text style={styles.title}>Selamat datang, {user?.username}!</Text>
            </View>

            {/* stats */}
            <View style={styles.statsContainer}>
                <StatCard title="Total Resep" value={stats.total} color="#3b82f6" icon="📊" />
                <StatCard title="Resep Pending" value={stats.pending} color="#eab308" icon="⏳" />
                <StatCard title="Resep Disetujui" value={stats.approved} color="#22c55e" icon="✓" />
                <StatCard title="Resep Ditolak" value={stats.rejected} color="#ef4444" icon="✗" />
            </View>

            {/* Menu Options */}
            <View style={styles.menuContainer}>
                <MenuButton
                    title="Review Pending"
                    subtitle="Review resep yang perlu disetujui"
                    icon="📝"
                    badge={stats.pending}
                    onPress={() => navigation.navigate("ModerationPending")}
                />
                <MenuButton
                    title="Review Saya"
                    subtitle="Resep yang telah saya review"
                    icon="📋"
                    onPress={() => navigation.navigate("ModerationReviewed")}
                />
                <MenuButton
                    title="Semua Resep"
                    subtitle="Lihat semua resep"
                    icon="📚"
                    onPress={() => navigation.navigate("ModerationAll")}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
    },
    header: {
        backgroundColor: "#fff",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#6b7280",
    },
    statsContainer: {
        padding: 16,
    },
    statCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#111",
    },
    statTitle: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 2,
    },
    menuContainer: {
        padding: 16,
    },
    menuButton: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    menuIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#fef2f2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    menuIcon: {
        fontSize: 24,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111",
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 13,
        color: "#6b7280",
    },
    badge: {
        backgroundColor: "#eab308",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    menuArrow: {
        fontSize: 24,
        color: "#9ca3af",
    },
    errorText: {
        color: "#dc2626",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
        paddingHorizontal: 20,
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

export default ModerationDashboardScreen;
