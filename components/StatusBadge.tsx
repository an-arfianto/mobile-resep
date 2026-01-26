import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { RecipeStatus } from "@/types";

interface StatusBadgeProps {
    status: RecipeStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getBadgeStyle = () => {
        switch (status) {
            case "approved":
                return {
                    bg: "#dcfce7",
                    text: "#166534",
                    label: "Disetujui",
                };
            case "pending":
                return {
                    bg: "#fef3c7",
                    text: "#854d0e",
                    label: "Pending",
                };
            case "rejected":
                return {
                    bg: "#fee2e2",
                    text: "#991b1b",
                    label: "Ditolak",
                };
            default:
                return {
                    bg: "#f3f4f6",
                    text: "#6b7280",
                    label: status,
                };
        }
    };

    const style = getBadgeStyle();

    return (
        <View style={[styles.badge, { backgroundColor: style.bg }]}>
            <Text style={[styles.badgeText, { color: style.text }]}>{style.label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
});

export default StatusBadge;
