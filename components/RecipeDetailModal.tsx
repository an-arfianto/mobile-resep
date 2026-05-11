import { colors } from "@/assets/color";
import type { Recipe, RootStackParamList } from "@/types";
import { formatDate, getIngredientsDisplay } from "@/utils/recipe";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RecipeDetailModalProps {
    visible: boolean;
    recipe: Recipe | null;
    onClose: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ visible, recipe, onClose }) => {
    const navigation = useNavigation<NavigationProp>();

    if (!recipe) return null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
                    <View style={styles.handleBar} />

                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title} numberOfLines={2}>
                                {recipe.name}
                            </Text>
                            <View
                                style={[
                                    styles.statusBadge,
                                    recipe.status === "pending"
                                        ? styles.badgePending
                                        : styles.badgeRejected,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        recipe.status === "pending"
                                            ? styles.textPending
                                            : styles.textRejected,
                                    ]}
                                >
                                    {recipe.status === "pending" ? "Pending" : "Ditolak"}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.categoryPill}>
                            <Text style={styles.categoryPillText}>{recipe.category}</Text>
                        </View>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {recipe.status === "pending" ? (
                            <View style={styles.noticePending}>
                                <Text style={styles.noticeTitle}>Menunggu Review</Text>
                                <Text style={styles.noticeTextPending}>
                                    Resep ini sedang menunggu persetujuan admin dan belum tampil ke
                                    publik.
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.noticeRejected}>
                                <Text style={styles.noticeTitle}>Resep Ditolak</Text>
                                <Text style={styles.noticeTextRejected}>
                                    {recipe.rejection_reason ??
                                        "Resep ini ditolak oleh admin. Silakan edit dan kirim ulang."}
                                </Text>
                            </View>
                        )}

                        <View style={styles.metaBox}>
                            <Text style={styles.metaText}>
                                Dibuat: {formatDate(recipe.created_at)}
                            </Text>
                        </View>

                        {recipe.ingredients ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Bahan-bahan</Text>
                                <Text style={styles.sectionBody}>
                                    {getIngredientsDisplay(recipe.ingredients)}
                                </Text>
                            </View>
                        ) : null}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => {
                                onClose();
                                navigation.navigate("EditRecipe", { recipeId: recipe.id });
                            }}
                        >
                            <Text style={styles.editButtonText}>Edit Resep</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>Tutup</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "85%",
        paddingBottom: 32,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        alignSelf: "center",
        marginTop: 12,
        marginBottom: 8,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 8,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: "flex-start",
    },
    badgePending: {
        backgroundColor: colors.warningSoft,
    },
    badgeRejected: {
        backgroundColor: colors.errorSoft,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },
    textPending: {
        color: colors.warning,
    },
    textRejected: {
        color: colors.error,
    },
    categoryPill: {
        backgroundColor: colors.secondarySoft,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    categoryPillText: {
        color: colors.secondary,
        fontSize: 12,
        fontWeight: "600",
    },
    body: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    noticePending: {
        backgroundColor: colors.warningSoft,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    noticeRejected: {
        backgroundColor: colors.errorSoft,
        borderLeftWidth: 4,
        borderLeftColor: colors.error,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    noticeTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    noticeTextPending: {
        fontSize: 13,
        color: colors.warning,
        lineHeight: 18,
    },
    noticeTextRejected: {
        fontSize: 13,
        color: colors.error,
        lineHeight: 18,
    },
    metaBox: {
        backgroundColor: colors.background,
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    metaText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: 6,
    },
    sectionBody: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    footer: {
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    editButton: {
        flex: 1,
        backgroundColor: colors.primarySoft,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    editButtonText: {
        color: colors.primary,
        fontWeight: "700",
        fontSize: 15,
    },
    closeButton: {
        flex: 1,
        backgroundColor: colors.overlay,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    closeButtonText: {
        color: colors.textSecondary,
        fontWeight: "600",
        fontSize: 15,
    },
});

export default RecipeDetailModal;
