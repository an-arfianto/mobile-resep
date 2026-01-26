import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { ModerationRecipe } from "@/types";
import LoadMoreButton from "@/components/LoadMoreButton";
import api from "@/services/api";
import Header from "@/components/Header";

const ModerationPendingScreen: React.FC = () => {
    const [recipes, setRecipes] = useState<ModerationRecipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [displayCount, setDisplayCount] = useState(10);
    const itemsPerPage = 10;

    // Reject modal state
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Detail modal state
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<ModerationRecipe | null>(null);

    const fetchPendingRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.moderation.getPending();
            setRecipes(response.data);
            setDisplayCount(10); // Reset
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPendingRecipes();
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPendingRecipes();
        }, []),
    );

    const handleLoadMore = () => {
        setDisplayCount((prev) => Math.min(prev + itemsPerPage, recipes.length));
    };

    const openDetailModal = (recipe: ModerationRecipe) => {
        setSelectedRecipe(recipe);
        setDetailModalVisible(true);
    };

    const handleApprove = async (recipeId: number) => {
        Alert.alert("Setujui", "Anda yakin menyetujui resep ini?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Setujui",
                onPress: async () => {
                    try {
                        setActionLoading(true);
                        await api.moderation.approve(recipeId);
                        setRecipes(recipes.filter((r) => r.id !== recipeId));
                        setDetailModalVisible(false);
                        Alert.alert("Success", "Resep telah disetujui!");
                    } catch (err: any) {
                        Alert.alert("Error", err.message);
                    } finally {
                        setActionLoading(false);
                    }
                },
            },
        ]);
    };

    const openRejectModal = (recipeId: number) => {
        setSelectedRecipeId(recipeId);
        setRejectionReason("");
        setRejectModalVisible(true);
    };

    const handleReject = async () => {
        if (!selectedRecipeId) return;

        try {
            setActionLoading(true);
            await api.moderation.reject(selectedRecipeId, rejectionReason || undefined);
            setRecipes(recipes.filter((r) => r.id !== selectedRecipeId));
            setRejectModalVisible(false);
            setDetailModalVisible(false);
            Alert.alert("Success", "Resep telah ditolak!");
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setActionLoading(false);
        }
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
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchPendingRecipes}>
                    <Text style={styles.retryButtonText}>Coba lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const displayedRecipes = recipes.slice(0, displayCount);

    return (
        <View style={styles.container}>
            <Header title="Review Pending" />
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#ef4444"]}
                        tintColor="#ef4444"
                    />
                }
            >
                {recipes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>✓</Text>
                        <Text style={styles.emptyTitle}>Semua resep telah direview!</Text>
                        <Text style={styles.emptyText}>
                            Tidak ada pending resep untuk saat ini.
                        </Text>
                    </View>
                ) : (
                    <>
                        {displayedRecipes.map((recipe) => (
                            <View key={recipe.id} style={styles.recipeCard}>
                                <View style={styles.recipeHeader}>
                                    <Text style={styles.recipeName}>{recipe.name}</Text>
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryText}>{recipe.category}</Text>
                                    </View>
                                </View>

                                <Text style={styles.recipeInfo}>
                                    Oleh: {recipe.creator_username}
                                </Text>
                                <Text style={styles.recipeInfo}>
                                    Dibuat: {formatDate(recipe.created_at)}
                                </Text>

                                {recipe.ingredients && (
                                    <View style={styles.ingredientsContainer}>
                                        <Text style={styles.ingredientsLabel}>Bahan:</Text>
                                        <Text style={styles.ingredientsText} numberOfLines={2}>
                                            {recipe.ingredients}
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.detailButton}
                                    onPress={() => openDetailModal(recipe)}
                                >
                                    <Text style={styles.detailButtonText}>
                                        Lihat detail lengkap →
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.approveButton}
                                        onPress={() => handleApprove(recipe.id)}
                                        disabled={actionLoading}
                                    >
                                        <Text style={styles.approveButtonText}>✓ Setujui</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.rejectButton}
                                        onPress={() => openRejectModal(recipe.id)}
                                        disabled={actionLoading}
                                    >
                                        <Text style={styles.rejectButtonText}>✕ Tolak</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
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
                            </View>

                            <View style={styles.modalInfo}>
                                <Text style={styles.modalInfoText}>
                                    Oleh: {selectedRecipe.creator_username}
                                </Text>
                                <Text style={styles.modalInfoText}>
                                    Dibuat: {formatDate(selectedRecipe.created_at)}
                                </Text>
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
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.approveButton, { flex: 1 }]}
                                onPress={() => handleApprove(selectedRecipe.id)}
                                disabled={actionLoading}
                            >
                                <Text style={styles.approveButtonText}>Setujui</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.rejectButton, { flex: 1 }]}
                                onPress={() => openRejectModal(selectedRecipe.id)}
                                disabled={actionLoading}
                            >
                                <Text style={styles.rejectButtonText}>Tolak</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                visible={rejectModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setRejectModalVisible(false)}
            >
                <View style={styles.rejectModalOverlay}>
                    <View style={styles.rejectModalContent}>
                        <Text style={styles.modalTitle}>Tolak Resep</Text>
                        <Text style={styles.modalSubtitle}>
                            Berikan alasan kenapa menolak resep tersebut!
                        </Text>

                        <TextInput
                            style={styles.reasonInput}
                            placeholder="e.g., bahan kurang lengkap, berisi hal yang buruk..."
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setRejectModalVisible(false)}
                                disabled={actionLoading}
                            >
                                <Text style={styles.modalCancelText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalRejectButton}
                                onPress={handleReject}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.modalRejectText}>Tolak Resep</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
        marginBottom: 12,
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        color: "#9a3412",
        fontSize: 12,
        fontWeight: "600",
    },
    recipeInfo: {
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 4,
    },
    ingredientsContainer: {
        marginTop: 12,
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
    detailButton: {
        marginTop: 12,
        marginBottom: 8,
    },
    detailButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ef4444",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },
    approveButton: {
        flex: 1,
        backgroundColor: "#22c55e",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    approveButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    rejectButton: {
        flex: 1,
        backgroundColor: "#ef4444",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    rejectButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
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
    // Detail Modal Styles
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
    modalActions: {
        flexDirection: "row",
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    // Reject Modal Styles
    rejectModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    rejectModalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        minHeight: 300,
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 16,
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 100,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    modalCancelText: {
        color: "#374151",
        fontWeight: "600",
        fontSize: 16,
    },
    modalRejectButton: {
        flex: 1,
        backgroundColor: "#ef4444",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    modalRejectText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});

export default ModerationPendingScreen;
