import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";

interface LoadMoreButtonProps {
    currentItems: number;
    totalItems: number;
    onLoadMore: () => void;
    loading?: boolean;
    itemsPerPage?: number;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
    currentItems,
    totalItems,
    onLoadMore,
    loading = false,
    itemsPerPage = 10,
}) => {
    const hasMore = currentItems < totalItems;
    const remaining = totalItems - currentItems;

    if (!hasMore) {
        return (
            <View style={styles.endContainer}>
                <Text style={styles.endText}>✓ Showing all {totalItems} items</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.infoText}>
                Showing {currentItems} of {totalItems}
            </Text>
            <TouchableOpacity style={styles.button} onPress={onLoadMore} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.buttonText}>Load More</Text>
                        <Text style={styles.remainingText}>
                            ({remaining > itemsPerPage ? itemsPerPage : remaining} more)
                        </Text>
                    </>
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
        color: "#6b7280",
        marginBottom: 12,
    },
    button: {
        backgroundColor: "#ef4444",
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
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    remainingText: {
        color: "#fee2e2",
        fontSize: 13,
        fontWeight: "500",
    },
    endContainer: {
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    endText: {
        fontSize: 14,
        color: "#22c55e",
        fontWeight: "500",
    },
});

export default LoadMoreButton;
