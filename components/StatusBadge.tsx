import { colors } from "@/assets/color";
import type { RecipeStatus } from "@/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatusBadgeProps {
    status: RecipeStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getBadgeStyle = () => {
        switch (status) {
            case "approved":
                return {
                    bg: colors.successSoft,
                    text: colors.success,
                    label: "Disetujui",
                };
            case "pending":
                return {
                    bg: colors.warningSoft,
                    text: colors.warning,
                    label: "Pending",
                };
            case "rejected":
                return {
                    bg: colors.errorSoft,
                    text: colors.error,
                    label: "Ditolak",
                };
            default:
                return {
                    bg: colors.overlay,
                    text: colors.textPrimary,
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
        paddingHorizontal: 12,
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
