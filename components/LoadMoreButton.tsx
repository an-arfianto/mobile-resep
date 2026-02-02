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
}) => {
    const hasMore = currentItems < totalItems;

    if (!hasMore) {
        return (
            <View style={styles.endContainer}>
                <Text style={styles.endText}>✓ {totalItems} item</Text>
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
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Load More</Text>
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
        backgroundColor: "#00796b",
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
