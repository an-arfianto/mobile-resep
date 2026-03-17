import { colors } from "@/assets/color";
import Header from "@/components/Header";
import api from "@/services/api";
import type { ModerationRecipe } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ModerationPendingScreen: React.FC = () => {
    const [recipes, setRecipes] = useState<ModerationRecipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [displayCount, setDisplayCount] = useState(10);
    const itemsPerPage = 10;

    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<ModerationRecipe | null>(null);

    const fetchPendingRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.moderation.getPending();
            setRecipes(response.data);
            setDisplayCount(10);
        } catch (err: any) {
            if (err.cancelled) return;
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
            const controller = new AbortController();
            fetchPendingRecipes();
            return () => controller.abort();
        }, []),
    );

    const displayedRecipes = recipes.slice(0, displayCount);
    const hasMore = displayCount < recipes.length;

    const handleLoadMore = () => {
        if (!hasMore) return;
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
                        setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
                        setDetailModalVisible(false);
                        Alert.alert("Sukses", "Resep telah disetujui!");
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
            setRecipes((prev) => prev.filter((r) => r.id !== selectedRecipeId));
            setRejectModalVisible(false);
            setDetailModalVisible(false);
            Alert.alert("Sukses", "Resep telah ditolak!");
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const renderItem = useCallback(
        ({ item: recipe }: { item: any }) => (
            <View style={styles.recipeCard}>
                <View style={styles.recipeHeader}>
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{recipe.category}</Text>
                    </View>
                </View>

                <Text style={styles.recipeInfo}>Oleh: {recipe.creator_username}</Text>
                <Text style={styles.recipeInfo}>Dibuat: {formatDate(recipe.created_at)}</Text>

                {recipe.ingredients && (
                    <View style={styles.ingredientsContainer}>
                        <Text style={styles.ingredientsLabel}>Bahan:</Text>
                        <Text style={styles.ingredientsText} numberOfLines={2}>
                            {recipe.ingredients}
                        </Text>
                    </View>
                )}

                <TouchableOpacity style={styles.detailButton} onPress={() => openDetailModal(recipe)}>
                    <Text style={styles.detailButtonText}>Lihat detail lengkap →</Text>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleApprove(recipe.id)}
                        disabled={actionLoading}
                    >
                        <Text style={styles.approveButtonText}>Setujui</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => openRejectModal(recipe.id)}
                        disabled={actionLoading}
                    >
                        <Text style={styles.rejectButtonText}>Tolak</Text>
                    </TouchableOpacity>
                </View>
            </View>
        ),
        [handleApprove, openRejectModal],
    );

    const ListEmpty = () => {
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
                    <TouchableOpacity style={styles.retryButton} onPress={fetchPendingRecipes}>
                        <Text style={styles.retryButtonText}>Coba lagi</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Semua resep telah direview!</Text>
                <Text style={styles.emptyText}>Tidak ada pending resep untuk saat ini.</Text>
            </View>
        );
    };

    const ListFooter = () => {
        if (loading && !refreshing) return null;
        if (hasMore) {
            return (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Memuat {displayCount} dari {recipes.length} resep
                    </Text>
                    <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
                </View>
            );
        }
        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>Menampilkan semua {recipes.length} resep</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header title="Resep Pending" />

            <FlatList
                data={displayedRecipes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={<ListEmpty />}
                ListFooterComponent={<ListFooter />}
                contentContainerStyle={styles.content}
            />

            <Modal
                visible={detailModalVisible}
                animationType="slide"
                onRequestClose={() => setDetailModalVisible(false)}
            >
                {selectedRecipe && (
                    <SafeAreaView style={styles.modalSafeArea}>
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
                            </View>

                            <View style={styles.modalInfo}>
                                <Text style={styles.modalInfoText}>Oleh: {selectedRecipe.creator_username}</Text>
                                <Text style={styles.modalInfoText}>
                                    Dibuat: {formatDate(selectedRecipe.created_at)}
                                </Text>
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
                    </SafeAreaView>
                )}
            </Modal>

            <Modal
                visible={rejectModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setRejectModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.rejectModalOverlay}
                    activeOpacity={1}
                    onPress={() => setRejectModalVisible(false)}
                >
                    <TouchableOpacity style={styles.rejectModalContent} activeOpacity={1} onPress={() => {}}>
                        <Text style={styles.modalTitle}>Tolak Resep</Text>
                        <Text style={styles.modalSubtitle}>Berikan alasan kenapa menolak resep tersebut!</Text>

                        <TextInput
                            style={styles.reasonInput}
                            placeholder="e.g., bahan kurang lengkap, berisi hal yang buruk..."
                            placeholderTextColor={colors.textMuted}
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
                                    <ActivityIndicator color={colors.textInverse} />
                                ) : (
                                    <Text style={styles.modalRejectText}>Tolak Resep</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
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
        paddingTop: 60,
        backgroundColor: colors.background,
    },
    content: {
        padding: 16,
        flexGrow: 1,
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
        marginBottom: 12,
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
    },
    categoryText: {
        color: colors.secondary,
        fontSize: 12,
        fontWeight: "600",
    },
    recipeInfo: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    ingredientsContainer: {
        marginTop: 12,
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
    detailButton: {
        marginTop: 12,
        marginBottom: 8,
    },
    detailButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.secondary,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },
    approveButton: {
        flex: 1,
        backgroundColor: colors.successSoft,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    approveButtonText: {
        color: colors.success,
        fontWeight: "600",
        fontSize: 14,
    },
    rejectButton: {
        flex: 1,
        backgroundColor: colors.errorSoft,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    rejectButtonText: {
        color: colors.error,
        fontWeight: "600",
        fontSize: 14,
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
    modalSafeArea: {
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
    modalActions: {
        flexDirection: "row",
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    rejectModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    rejectModalContent: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
    },
    modalSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.inputBackground,
        color: colors.textPrimary,
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
        backgroundColor: colors.overlay,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    modalCancelText: {
        color: colors.textPrimary,
        fontWeight: "600",
        fontSize: 16,
    },
    modalRejectButton: {
        flex: 1,
        backgroundColor: colors.error,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    modalRejectText: {
        color: colors.textInverse,
        fontWeight: "600",
        fontSize: 16,
    },
});

export default ModerationPendingScreen;
