import { colors } from "@/assets/color";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = "Resep App" }) => {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
});

export default Header;
