import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import api from "@/services/api";
import type { RootStackParamList } from "@/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AdminDashboardScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.admin.getStats();
            setStats(response.data);
        } catch (err: any) {
            console.error("Error fetching admin stats:", err);
            setError(err.message || "Failed to load statistics");
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
                <Header title="Admin Dashboard" />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#dc2626" />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header title="Admin Dashboard" />
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
            <Header title="Admin Dashboard" />
            <ScrollView
                style={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#dc2626"]}
                        tintColor="#dc2626"
                    />
                }
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Selamat datang, {user?.username}!</Text>
                    <Text style={styles.welcomeSubtext}>Admin Dashboard</Text>
                </View>

                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, styles.blueCard]}>
                        <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
                        <Text style={styles.statLabel}>Total User</Text>
                    </View>
                    <View style={[styles.statCard, styles.greenCard]}>
                        <Text style={styles.statValue}>{stats?.totalRecipes || 0}</Text>
                        <Text style={styles.statLabel}>Total Resep</Text>
                    </View>
                    <View style={[styles.statCard, styles.purpleCard]}>
                        <Text style={styles.statValue}>
                            {stats?.recipesByCategory?.length || 0}
                        </Text>
                        <Text style={styles.statLabel}>Kategori</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu</Text>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate("AdminUsers")}
                    >
                        <Text style={styles.actionTitle}>Kelola User</Text>
                        <Text style={styles.actionDesc}>Kelola semua user</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate("AdminRecipes")}
                    >
                        <Text style={styles.actionTitle}>Kelola Resep</Text>
                        <Text style={styles.actionDesc}>Kelola semua resep</Text>
                    </TouchableOpacity>
                </View>

                {stats?.recipesByCategory && stats.recipesByCategory.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Total Resep</Text>
                        {stats.recipesByCategory.map((cat: any) => (
                            <View key={cat.category} style={styles.categoryRow}>
                                <Text style={styles.categoryName}>{cat.category}</Text>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryCount}>{cat.count}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
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
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    welcomeSection: {
        backgroundColor: "#fff",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#111",
    },
    welcomeSubtext: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: 100,
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
    },
    blueCard: {
        backgroundColor: "#dbeafe",
    },
    greenCard: {
        backgroundColor: "#dcfce7",
    },
    purpleCard: {
        backgroundColor: "#f3e8ff",
    },
    statValue: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        textAlign: "center",
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
    },
    actionCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 4,
    },
    actionDesc: {
        fontSize: 14,
        color: "#6b7280",
    },
    categoryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: "500",
    },
    categoryBadge: {
        backgroundColor: "#fee2e2",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryCount: {
        color: "#b91c1c",
        fontWeight: "bold",
        fontSize: 12,
    },
    errorText: {
        color: "#dc2626",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#dc2626",
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

export default AdminDashboardScreen;
