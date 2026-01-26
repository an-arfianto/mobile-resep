import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import type { ModerationRecipe } from "@/types";
import api from "@/services/api";
import StatusBadge from "@/components/StatusBadge";
import LoadMoreButton from "@/components/LoadMoreButton";
import Header from "@/components/Header";

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
            setDisplayCount(10); // Reset to initial count
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
                <ActivityIndicator size="large" color="#3b82f6" />
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
            <Header title="Reviewed Recipe" />
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#3b82f6"]}
                        tintColor="#3b82f6"
                    />
                }
            >
                {recipes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyTitle}>Tidak ada resep</Text>
                        <Text style={styles.emptyText}>Anda belum mereview resep.</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoText}>
                                {recipes.length} resep telah direview
                            </Text>
                        </View>

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
                                    <Text style={styles.recipeInfo}>
                                        Oleh: {recipe.creator_username}
                                    </Text>
                                    <Text style={styles.recipeInfo}>
                                        Dibuat: {formatDate(recipe.created_at)}
                                    </Text>
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

                                <Text style={styles.tapToView}>Tap untuk detail lengkap</Text>
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
                                    <Text style={styles.categoryText}>
                                        {selectedRecipe.category}
                                    </Text>
                                </View>
                                <StatusBadge status={selectedRecipe.status} />
                            </View>

                            <View style={styles.modalInfo}>
                                <Text style={styles.modalInfoText}>
                                    Oleh: {selectedRecipe.creator_username}
                                </Text>
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
                                    <Text style={styles.modalSectionText}>
                                        {selectedRecipe.description}
                                    </Text>
                                </View>
                            )}

                            {selectedRecipe.ingredients && (
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Bahan-bahan</Text>
                                    <Text style={styles.modalSectionText}>
                                        {selectedRecipe.ingredients}
                                    </Text>
                                </View>
                            )}

                            {selectedRecipe.instructions && (
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Instruksi</Text>
                                    <Text style={styles.modalSectionText}>
                                        {selectedRecipe.instructions}
                                    </Text>
                                </View>
                            )}

                            {selectedRecipe.status === "rejected" &&
                                selectedRecipe.rejection_reason && (
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>
                                            Alasan Penolakan
                                        </Text>
                                        <View style={styles.rejectionContainer}>
                                            <Text style={styles.rejectionText}>
                                                {selectedRecipe.rejection_reason}
                                            </Text>
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
        backgroundColor: "#f9fafb",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    infoContainer: {
        backgroundColor: "#dbeafe",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoText: {
        color: "#1e40af",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    recipeCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        color: "#111",
        marginRight: 8,
    },
    categoryBadge: {
        backgroundColor: "#fed7aa",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: "flex-start",
        marginBottom: 12,
    },
    categoryText: {
        color: "#9a3412",
        fontSize: 12,
        fontWeight: "600",
    },
    recipeDetails: {
        marginBottom: 12,
    },
    recipeInfo: {
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 4,
    },
    ingredientsContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
    },
    ingredientsLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 4,
    },
    ingredientsText: {
        fontSize: 13,
        color: "#6b7280",
    },
    rejectionContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: "#fee2e2",
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#dc2626",
    },
    rejectionLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#991b1b",
        marginBottom: 4,
    },
    rejectionText: {
        fontSize: 13,
        color: "#dc2626",
    },
    tapToView: {
        marginTop: 12,
        fontSize: 13,
        color: "#3b82f6",
        fontWeight: "600",
        textAlign: "center",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 20,
    },
    errorText: {
        color: "#dc2626",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    retryButton: {
        backgroundColor: "#3b82f6",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111",
        flex: 1,
    },
    closeButton: {
        fontSize: 24,
        color: "#6b7280",
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
        color: "#6b7280",
    },
    modalSection: {
        marginBottom: 20,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111",
        marginBottom: 8,
    },
    modalSectionText: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 20,
    },
});

export default ModerationReviewedScreen;
