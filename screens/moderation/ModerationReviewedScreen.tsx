import { colors } from "@/assets/color";
import Header from "@/components/Header";
import LoadMoreButton from "@/components/LoadMoreButton";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
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

const ModerationReviewedScreen: React.FC = () => {
    const { user } = useAuth();
    const [recipes, setRecipes] = useState<ModerationRecipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [displayCount, setDisplayCount] = useState(10);
    const itemsPerPage = 10;

    // Detail Modal
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<ModerationRecipe | null>(null);

    const fetchReviewedRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.moderation.getAllRecipes();
            // Filter recipes reviewed by current user (excluding pending)
            const reviewedByMe = response.data.filter(
                (r) => Number(r.reviewed_by) === Number(user?.id) && r.status !== "pending",
            );
            setRecipes(reviewedByMe);
            setDisplayCount(10);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchReviewedRecipes();
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchReviewedRecipes();
        }, []),
    );

    const handleLoadMore = () => {
        setDisplayCount((prev) => Math.min(prev + itemsPerPage, recipes.length));
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

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchReviewedRecipes}>
                    <Text style={styles.retryButtonText}>Coba lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const displayedRecipes = recipes.slice(0, displayCount);

    return (
        <View style={styles.container}>
            <Header title="Histori Resep" />
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
                {recipes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>Tidak ada resep</Text>
                        <Text style={styles.emptyText}>Anda belum mereview resep.</Text>
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
                                    <Text style={styles.recipeName}>{recipe.name}</Text>
                                    <StatusBadge status={recipe.status} />
                                </View>

                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{recipe.category}</Text>
                                </View>

                                <View style={styles.recipeDetails}>
                                    <Text style={styles.recipeInfo}>Oleh: {recipe.creator_username}</Text>
                                    <Text style={styles.recipeInfo}>Dibuat: {formatDate(recipe.created_at)}</Text>
                                    {recipe.reviewed_at && (
                                        <Text style={styles.recipeInfo}>
                                            Direview: {formatDate(recipe.reviewed_at)}
                                        </Text>
                                    )}
                                </View>

                                {recipe.ingredients && (
                                    <View style={styles.ingredientsContainer}>
                                        <Text style={styles.ingredientsLabel}>Bahan:</Text>
                                        <Text style={styles.ingredientsText} numberOfLines={2}>
                                            {recipe.ingredients}
                                        </Text>
                                    </View>
                                )}

                                {recipe.status === "rejected" && recipe.rejection_reason && (
                                    <View style={styles.rejectionContainer}>
                                        <Text style={styles.rejectionLabel}>Alasan:</Text>
                                        <Text style={styles.rejectionText} numberOfLines={2}>
                                            {recipe.rejection_reason}
                                        </Text>
                                    </View>
                                )}

                                <Text style={styles.tapToView}>Lihat detail lengkap</Text>
                            </TouchableOpacity>
                        ))}

                        <LoadMoreButton
                            currentItems={displayCount}
                            totalItems={recipes.length}
                            onLoadMore={handleLoadMore}
                            itemsPerPage={itemsPerPage}
                        />
                    </>
                )}
            </ScrollView>

            {/* Detail Modal */}
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
                                {selectedRecipe.reviewed_at && (
                                    <Text style={styles.modalInfoText}>
                                        Direview: {formatDate(selectedRecipe.reviewed_at)}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    recipeCard: {
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
    recipeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    recipeName: {
        flex: 1,
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginRight: 8,
    },
    categoryBadge: {
        backgroundColor: colors.secondarySoft,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginBottom: 12,
    },
    categoryText: {
        color: colors.secondary,
        fontSize: 12,
        fontWeight: "600",
    },
    recipeDetails: {
        marginBottom: 12,
    },
    recipeInfo: {
        fontSize: 13,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    ingredientsContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: colors.inputBackground,
        borderRadius: 8,
    },
    ingredientsLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    ingredientsText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    rejectionContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: colors.errorSoft,
        borderRadius: 8,
    },
    rejectionLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.error,
        marginBottom: 4,
    },
    rejectionText: {
        fontSize: 13,
        color: colors.error,
    },
    tapToView: {
        marginTop: 12,
        fontSize: 13,
        color: colors.secondary,
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
        lineHeight: 20,
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
        color: colors.textSecondary,
        lineHeight: 20,
    },
});

export default ModerationReviewedScreen;
