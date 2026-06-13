import { colors } from "@/assets/color";
import Header from "@/components/Header";
import RecipeCardWithStatus from "@/components/RecipeCardWithStatus";
import { useRecipeStore } from "@/stores/recipeStore";
import type { RecipeStatus, RootStackParamList } from "@/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabKey = "all" | RecipeStatus;

const TABS: { key: TabKey; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "approved", label: "Disetujui" },
    { key: "pending", label: "Pending" },
    { key: "rejected", label: "Ditolak" },
];

const MyRecipesScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { myRecipes, loading, error, showMyRecipes, deleteRecipe } = useRecipeStore();

    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>("all");
    const [displayCount, setDisplayCount] = useState(10);

    useFocusEffect(
        useCallback(() => {
            showMyRecipes();
        }, []),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await showMyRecipes();
        setRefreshing(false);
    }, []);

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        setDisplayCount(10);
    };

    const handleDelete = async (id: number) => {
        await deleteRecipe(id);
    };

    const filtered =
        activeTab === "all" ? myRecipes : myRecipes.filter((r) => r.status === activeTab);

    const displayed = filtered.slice(0, displayCount);
    const hasMore = displayCount < filtered.length;

    const ListEmpty = () => {
        if (loading && !refreshing) {
            return <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
        }
        if (error) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={showMyRecipes}>
                        <Text style={styles.retryButtonText}>Coba lagi</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        if (myRecipes.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Anda belum membuat resep.</Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => navigation.navigate("CreateRecipe")}
                    >
                        <Text style={styles.emptyButtonText}>Buat resep pertama</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada resep dengan filter ini.</Text>
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
        if (hasMore) {
            return (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Memuat {displayCount} dari {filtered.length} resep
                    </Text>
                    <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
                </View>
            );
        }
        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>Menampilkan semua {filtered.length} resep</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header title="Resep Saya" />

            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate("CreateRecipe")}
                >
                    <Text style={styles.createButtonText}>+ Tambah Resep</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayed}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <RecipeCardWithStatus recipe={item} onDelete={() => handleDelete(item.id)} />
                )}
                onEndReached={() => {
                    if (hasMore) setDisplayCount((prev) => Math.min(prev + 10, filtered.length));
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
                contentContainerStyle={styles.content}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    actionBar: {
        backgroundColor: colors.surface,
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        alignItems: "flex-end",
    },
    createButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createButtonText: {
        color: colors.textInverse,
        fontWeight: "600",
        fontSize: 14,
    },
    tabsContainer: {
        marginBottom: 4,
    },
    tabsContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
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
    content: {
        padding: 16,
        flexGrow: 1,
    },
    loader: {
        marginTop: 40,
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textPrimary,
        marginBottom: 20,
        textAlign: "center",
    },
    errorText: {
        color: colors.error,
        textAlign: "center",
        fontSize: 14,
        marginBottom: 16,
    },
    emptyButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: colors.textInverse,
        fontWeight: "bold",
        fontSize: 16,
    },
    retryButton: {
        backgroundColor: colors.error,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.textInverse,
        fontWeight: "600",
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
    footerLoader: {
        marginTop: 4,
    },
});

export default MyRecipesScreen;
