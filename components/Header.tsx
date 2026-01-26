import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = "Recipe App" }) => {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>🍳 {title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111",
    },
});

export default Header;
