import { colors } from "@/assets/color";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LoadMoreButtonProps {
    currentItems: number;
    totalItems: number;
    onLoadMore: () => void;
    loading?: boolean;
    itemsPerPage?: number;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ currentItems, totalItems, onLoadMore, loading = false }) => {
    const hasMore = currentItems < totalItems;

    if (!hasMore) {
        return (
            <View style={styles.endContainer}>
                <Text style={styles.endText}>Total {totalItems} item</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.infoText}>
                {currentItems} dari {totalItems}
            </Text>
            <TouchableOpacity style={styles.button} onPress={onLoadMore} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color={colors.textInverse} />
                ) : (
                    <Text style={styles.buttonText}>Coba Lagi</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    infoText: {
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: 12,
    },
    button: {
        backgroundColor: colors.primarySoft,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minWidth: 200,
        justifyContent: "center",
    },
    buttonText: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: "600",
    },
    endContainer: {
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    endText: {
        fontSize: 14,
        color: colors.textMuted,
        fontWeight: "500",
    },
});

export default LoadMoreButton;
