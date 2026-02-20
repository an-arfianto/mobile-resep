import { colors } from "@/assets/color";
import Header from "@/components/Header";
import LoadMoreButton from "@/components/LoadMoreButton";
import StatusBadge from "@/components/StatusBadge";
import api from "@/services/api";
import type { ModerationRecipe } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ModerationAllScreen: React.FC = () => {
    const [recipes, setRecipes] = useState<ModerationRecipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [displayCount, setDisplayCount] = useState(10);
    const itemsPerPage = 10;
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<ModerationRecipe | null>(null);

    const fetchAllRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.moderation.getAllRecipes();
            setRecipes(response.data);
            setDisplayCount(10);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAllRecipes();
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAllRecipes();
        }, []),
    );

    const handleLoadMore = () => {
        const filtered = filteredRecipes;
        setDisplayCount((prev) => Math.min(prev + itemsPerPage, filtered.length));
    };

    const openDetailModal = (recipe: ModerationRecipe) => {
        setSelectedRecipe(recipe);
        setDetailModalVisible(true);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const filteredRecipes = filter === "all" ? recipes : recipes.filter((r) => r.status === filter);

    const counts = {
        all: recipes.length,
        pending: recipes.filter((r) => r.status === "pending").length,
        approved: recipes.filter((r) => r.status === "approved").length,
        rejected: recipes.filter((r) => r.status === "rejected").length,
    };

    const FilterButton = ({ label, value, count }: any) => (
        <TouchableOpacity
            style={[styles.filterButton, filter === value && styles.filterButtonActive]}
            onPress={() => {
                setFilter(value);
                setDisplayCount(10);
            }}
        >
            <Text style={[styles.filterButtonText, filter === value && styles.filterButtonTextActive]}>{label}</Text>
            {count > 0 && (
                <View style={[styles.filterBadge, filter === value && styles.filterBadgeActive]}>
                    <Text style={[styles.filterBadgeText, filter === value && styles.filterBadgeTextActive]}>
                        {count}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <Header title="Semua Resep" />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header title="Semua Resep" />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchAllRecipes}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const displayedRecipes = filteredRecipes.slice(0, displayCount);

    return (
        <View style={styles.container}>
            <Header title="Semua Resep" />

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
                contentContainerStyle={styles.filterContent}
            >
                <FilterButton label="Semua" value="all" count={counts.all} />
                <FilterButton label="Pending" value="pending" count={counts.pending} />
                <FilterButton label="Disetujui" value="approved" count={counts.approved} />
                <FilterButton label="Ditolak" value="rejected" count={counts.rejected} />
            </ScrollView>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {filteredRecipes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>Tidak ada resep</Text>
                        <Text style={styles.emptyText}>Tidak ada resep yang sesuai dengan filter.</Text>
                    </View>
                ) : (
                    <>
                        {displayedRecipes.map((recipe) => (
                            <TouchableOpacity
                                key={recipe.id}
                                style={styles.recipeCard}
                                onPress={() => openDetailModal(recipe)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.recipeHeader}>
                                    <Text style={styles.recipeName} numberOfLines={1}>
                                        {recipe.name}
                                    </Text>
                                    <StatusBadge status={recipe.status} />
                                </View>

                                <View style={styles.recipeRow}>
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryText}>{recipe.category}</Text>
                                    </View>
                                    <Text style={styles.dateText}>{formatDate(recipe.created_at)}</Text>
                                </View>

                                <Text style={styles.recipeInfo}>Oleh: {recipe.creator_username}</Text>

                                {recipe.reviewed_by && recipe.reviewer_username && (
                                    <Text style={styles.reviewInfo}>Direview oleh: {recipe.reviewer_username}</Text>
                                )}

                                {recipe.status === "rejected" && recipe.rejection_reason && (
                                    <View style={styles.rejectionContainer}>
                                        <Text style={styles.rejectionText} numberOfLines={2}>
                                            {recipe.rejection_reason}
                                        </Text>
                                    </View>
                                )}

                                <Text style={styles.tapToView}>Tap untuk detail lengkap</Text>
                            </TouchableOpacity>
                        ))}

                        <LoadMoreButton
                            currentItems={displayCount}
                            totalItems={filteredRecipes.length}
                            onLoadMore={handleLoadMore}
                            itemsPerPage={itemsPerPage}
                        />
                    </>
                )}
            </ScrollView>

            {/* Detail Modal - Same as before */}
            <Modal
                visible={detailModalVisible}
                animationType="slide"
                onRequestClose={() => setDetailModalVisible(false)}
            >
                {selectedRecipe && (
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.modalBadges}>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{selectedRecipe.category}</Text>
                                </View>
                                <StatusBadge status={selectedRecipe.status} />
                            </View>

                            <View style={styles.modalInfo}>
                                <Text style={styles.modalInfoText}>Oleh: {selectedRecipe.creator_username}</Text>
                                <Text style={styles.modalInfoText}>
                                    Dibuat: {formatDate(selectedRecipe.created_at)}
                                </Text>
                                {selectedRecipe.reviewed_by && selectedRecipe.reviewer_username && (
                                    <Text style={styles.modalInfoText}>
                                        Direview oleh: {selectedRecipe.reviewer_username}
                                    </Text>
                                )}
                                {selectedRecipe.reviewed_at && (
                                    <Text style={styles.modalInfoText}>
                                        Pada: {formatDate(selectedRecipe.reviewed_at)}
                                    </Text>
                                )}
                            </View>

                            {selectedRecipe.description && (
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Deskripsi</Text>
                                    <Text style={styles.modalSectionText}>{selectedRecipe.description}</Text>
                                </View>
                            )}

                            {selectedRecipe.ingredients && (
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Bahan-bahan</Text>
                                    <Text style={styles.modalSectionText}>{selectedRecipe.ingredients}</Text>
                                </View>
                            )}

                            {selectedRecipe.instructions && (
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Instruksi</Text>
                                    <Text style={styles.modalSectionText}>{selectedRecipe.instructions}</Text>
                                </View>
                            )}

                            {selectedRecipe.status === "rejected" && selectedRecipe.rejection_reason && (
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Alasan Penolakan</Text>
                                    <View style={styles.rejectionContainer}>
                                        <Text style={styles.rejectionText}>{selectedRecipe.rejection_reason}</Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                )}
            </Modal>
        </View>
    );
};

// Styles remain the same...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.surface,
    },
    filterContainer: {
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        maxHeight: 60,
    },
    filterContent: {
        padding: 12,
        gap: 8,
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.surface,
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    filterButtonTextActive: {
        color: colors.textInverse,
    },
    filterBadge: {
        backgroundColor: colors.overlay,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 6,
    },
    filterBadgeActive: {
        backgroundColor: colors.overlay,
    },
    filterBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    filterBadgeTextActive: {
        color: colors.textPrimary,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    recipeCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    recipeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    recipeName: {
        flex: 1,
        fontSize: 16,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginRight: 8,
    },
    recipeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    categoryBadge: {
        backgroundColor: colors.secondarySoft,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        color: colors.secondary,
        fontSize: 11,
        fontWeight: "600",
    },
    dateText: {
        fontSize: 12,
        color: colors.textMuted,
    },
    recipeInfo: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 3,
    },
    reviewInfo: {
        fontSize: 12,
        color: colors.success,
        fontWeight: "500",
        marginBottom: 8,
    },
    rejectionContainer: {
        marginTop: 8,
        padding: 8,
        backgroundColor: colors.errorSoft,
        borderRadius: 6,
    },
    rejectionText: {
        fontSize: 12,
        color: colors.error,
    },
    tapToView: {
        marginTop: 8,
        fontSize: 13,
        color: colors.primary,
        fontWeight: "600",
        textAlign: "center",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
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
    modalContainer: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.textPrimary,
        flex: 1,
    },
    closeButton: {
        fontSize: 24,
        color: colors.textPrimary,
        padding: 4,
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    modalBadges: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    modalInfo: {
        marginBottom: 16,
        gap: 4,
    },
    modalInfoText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    modalSection: {
        marginBottom: 20,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: 8,
    },
    modalSectionText: {
        fontSize: 14,
        color: colors.textPrimary,
        lineHeight: 20,
    },
});

export default ModerationAllScreen;
