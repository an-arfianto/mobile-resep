import { colors } from "@/assets/color";
import Header from "@/components/Header";
import RejectReasonModal from "@/components/RejectReasonModal";
import api from "@/services/api";
import { formatDate } from "@/utils/recipe";
import type { Recipe, RootStackParamList } from "@/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabKey = "all" | "pending" | "approved" | "rejected";

const TABS: { key: TabKey; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Disetujui" },
    { key: "rejected", label: "Ditolak" },
];

const AdminRecipesScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    const [activeTab, setActiveTab] = useState<TabKey>("pending");
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayCount, setDisplayCount] = useState(10);

    const displayed = recipes.slice(0, displayCount);
    const hasMore = displayCount < recipes.length;

    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
    const [rejectTargetName, setRejectTargetName] = useState("");
    const [rejectLoading, setRejectLoading] = useState(false);

    const fetchRecipes = async (tab: TabKey = activeTab) => {
        setLoading(true);
        setError(null);
        try {
            let response;
            if (tab === "all") {
                response = await api.admin.getRecipes();
            } else if (tab === "pending") {
                response = await api.admin.getPendingRecipes();
            } else {
                response = await api.admin.getRecipesByStatus(tab);
            }
            setRecipes(response.data);
            setDisplayCount(10);
        } catch (err: unknown) {
            const message =
                typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message: unknown }).message)
                    : "Gagal memuat resep";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRecipes(activeTab);
        }, [activeTab]),
    );

    const handleTabChange = (tab: TabKey) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setRecipes([]);
        setDisplayCount(10);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchRecipes(activeTab);
        setRefreshing(false);
    }, [activeTab]);

    const handleDelete = (id: number, name: string) => {
        Alert.alert("Hapus Resep", `Anda yakin ingin menghapus "${name}"?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.admin.deleteRecipe(id);
                        setRecipes((prev) => prev.filter((r) => r.id !== id));
                        Alert.alert("Berhasil", "Resep berhasil dihapus");
                    } catch (err: unknown) {
                        const message =
                            typeof err === "object" && err !== null && "message" in err
                                ? String((err as { message: unknown }).message)
                                : "Gagal menghapus resep";
                        Alert.alert("Error", message);
                    }
                },
            },
        ]);
    };

    const handleApprove = (id: number, name: string) => {
        Alert.alert("Setujui Resep", `Setujui resep "${name}"?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Setujui",
                onPress: async () => {
                    try {
                        await api.admin.approveRecipe(id);
                        setRecipes((prev) => prev.filter((r) => r.id !== id));
                        Alert.alert("Berhasil", "Resep berhasil disetujui");
                    } catch (err: unknown) {
                        const message =
                            typeof err === "object" && err !== null && "message" in err
                                ? String((err as { message: unknown }).message)
                                : "Gagal menyetujui resep";
                        Alert.alert("Error", message);
                    }
                },
            },
        ]);
    };

    const handleReject = (id: number, name: string) => {
        setRejectTargetId(id);
        setRejectTargetName(name);
        setRejectModalVisible(true);
    };

    const handleRejectConfirm = async (reason: string) => {
        if (!rejectTargetId) return;
        setRejectLoading(true);
        try {
            await api.admin.rejectRecipe(rejectTargetId, reason || undefined);
            setRecipes((prev) => prev.filter((r) => r.id !== rejectTargetId));
            setRejectModalVisible(false);
            Alert.alert("Berhasil", `Resep "${rejectTargetName}" berhasil ditolak`);
        } catch (err: unknown) {
            const message =
                typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message: unknown }).message)
                    : "Gagal menolak resep";
            Alert.alert("Error", message);
        } finally {
            setRejectLoading(false);
        }
    };

    const renderItem = useCallback(
        ({ item }: { item: Recipe }) => (
            <View style={styles.recipeCard}>
                <Text style={styles.recipeName}>{item.name}</Text>
                <View style={styles.recipeInfo}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <View
                        style={[
                            styles.statusBadge,
                            item.status === "approved"
                                ? styles.statusApproved
                                : item.status === "rejected"
                                  ? styles.statusRejected
                                  : styles.statusPending,
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                item.status === "approved"
                                    ? styles.statusTextApproved
                                    : item.status === "rejected"
                                      ? styles.statusTextRejected
                                      : styles.statusTextPending,
                            ]}
                        >
                            {item.status === "approved"
                                ? "Disetujui"
                                : item.status === "rejected"
                                  ? "Ditolak"
                                  : "Pending"}
                        </Text>
                    </View>
                </View>
                <View style={styles.authorRow}>
                    <Text style={styles.authorText}>oleh {item.creator_username}</Text>
                    {item.creator_is_suspended ? (
                        <View style={styles.suspendedBadge}>
                            <Text style={styles.suspendedText}>Disuspend</Text>
                        </View>
                    ) : null}
                </View>
                {item.ingredients ? (
                    <Text style={styles.ingredients} numberOfLines={2}>
                        {typeof item.ingredients === "string" ? item.ingredients : ""}
                    </Text>
                ) : null}
                <Text style={styles.dateText}>Dibuat: {formatDate(item.created_at)}</Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })}
                    >
                        <Text style={styles.viewButtonText}>Lihat</Text>
                    </TouchableOpacity>
                    {item.status === "pending" && !item.creator_is_suspended ? (
                        <>
                            <TouchableOpacity
                                style={styles.approveButton}
                                onPress={() => handleApprove(item.id, item.name)}
                            >
                                <Text style={styles.approveButtonText}>Setujui</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={() => handleReject(item.id, item.name)}
                            >
                                <Text style={styles.rejectButtonText}>Tolak</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item.id, item.name)}
                    >
                        <Text style={styles.deleteButtonText}>Hapus</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ),
        [activeTab],
    );

    const ListEmpty = () => {
        if (loading && !refreshing)
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            );
        if (error)
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => fetchRecipes(activeTab)}
                    >
                        <Text style={styles.retryButtonText}>Coba lagi</Text>
                    </TouchableOpacity>
                </View>
            );
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada resep</Text>
            </View>
        );
    };

    const ListHeader = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
        >
            {TABS.map((tab) => (
                <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                    onPress={() => handleTabChange(tab.key)}
                >
                    <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const ListFooter = () => {
        if (loading && !refreshing) return null;
        if (hasMore)
            return (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Memuat {displayCount} dari {recipes.length} resep
                    </Text>
                    <ActivityIndicator color={colors.primary} style={{ marginTop: 4 }} />
                </View>
            );
        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>Menampilkan semua {recipes.length} resep</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header title="Kelola Resep" />
            <FlatList
                data={displayed}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                onEndReached={() => {
                    if (hasMore) setDisplayCount((prev) => Math.min(prev + 10, recipes.length));
                }}
                onEndReachedThreshold={0.3}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListHeaderComponent={<ListHeader />}
                ListEmptyComponent={<ListEmpty />}
                ListFooterComponent={<ListFooter />}
                contentContainerStyle={styles.contentContainer}
            />
            <RejectReasonModal
                visible={rejectModalVisible}
                onClose={() => setRejectModalVisible(false)}
                onConfirm={handleRejectConfirm}
                loading={rejectLoading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: 16,
        flexGrow: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    tabsContainer: {
        marginBottom: 16,
        marginHorizontal: -16,
    },
    tabsContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tabActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    tabTextActive: {
        color: colors.textInverse,
    },
    recipeCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    recipeName: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 8,
    },
    recipeInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    categoryBadge: {
        backgroundColor: colors.primarySoft,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: "600",
    },
    authorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    authorText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    ingredients: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    dateText: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 8,
    },
    viewButton: {
        flex: 1,
        backgroundColor: colors.secondarySoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    viewButtonText: {
        color: colors.secondary,
        fontWeight: "600",
    },
    approveButton: {
        flex: 1,
        backgroundColor: colors.successSoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    approveButtonText: {
        color: colors.success,
        fontWeight: "600",
    },
    rejectButton: {
        flex: 1,
        backgroundColor: colors.warningSoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    rejectButtonText: {
        color: colors.warning,
        fontWeight: "600",
    },
    deleteButton: {
        flex: 1,
        backgroundColor: colors.errorSoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteButtonText: {
        color: colors.error,
        fontWeight: "600",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },
    statusApproved: {
        backgroundColor: colors.successSoft,
    },
    statusRejected: {
        backgroundColor: colors.errorSoft,
    },
    statusPending: {
        backgroundColor: colors.warningSoft,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
    },
    statusTextApproved: {
        color: colors.success,
    },
    statusTextRejected: {
        color: colors.error,
    },
    statusTextPending: {
        color: colors.warning,
    },
    suspendedBadge: {
        backgroundColor: colors.errorSoft,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    suspendedText: {
        color: colors.error,
        fontSize: 11,
        fontWeight: "700",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
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
    footer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    footerText: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 4,
    },
});

export default AdminRecipesScreen;
