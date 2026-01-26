import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Header from "@/components/Header";
import LoadMoreButton from "@/components/LoadMoreButton";
import api from "@/services/api";

const AdminUsersScreen: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination
    const [displayCount, setDisplayCount] = useState(15);
    const itemsPerPage = 15;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.admin.getUsers();
            setUsers(response.data);
            setDisplayCount(15); // Reset to initial count
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUsers();
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchUsers();
        setRefreshing(false);
    }, []);

    const handleLoadMore = () => {
        setDisplayCount(prev => Math.min(prev + itemsPerPage, users.length));
    };

    const promoteUser = (userId: number, username: string) => {
        Alert.alert(
            "Promote to Moderator",
            `Promote ${username} to Moderator?\n\nThey will be able to approve/reject recipes.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Promote",
                    onPress: async () => {
                        try {
                            await api.admin.promoteUser(userId);
                            Alert.alert("Success", `${username} has been promoted to Moderator!`);
                            await fetchUsers();
                        } catch (err: any) {
                            Alert.alert("Error", err.message || "Failed to promote user");
                        }
                    },
                },
            ]
        );
    };

    const demoteUser = (userId: number, username: string) => {
        Alert.alert(
            "Demote to User",
            `Demote ${username} back to regular User?\n\nThey will lose moderator privileges.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Demote",
                    onPress: async () => {
                        try {
                            await api.admin.demoteUser(userId);
                            Alert.alert("Success", `${username} has been demoted to User.`);
                            await fetchUsers();
                        } catch (err: any) {
                            Alert.alert("Error", err.message || "Failed to demote user");
                        }
                    },
                },
            ]
        );
    };

    const deleteUser = (userId: number, username: string, recipeCount: number) => {
        const recipeWarning = recipeCount > 0
            ? `\n\n⚠️ WARNING: This will also DELETE ${recipeCount} recipe(s) created by this user!`
            : '';

        Alert.alert(
            "Delete User",
            `Are you sure you want to DELETE user "${username}"?${recipeWarning}\n\nThis action CANNOT be undone!`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        // Double confirmation for users with recipes
                        if (recipeCount > 0) {
                            Alert.alert(
                                "FINAL CONFIRMATION",
                                `Delete "${username}" and their ${recipeCount} recipe(s)?`,
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: async () => {
                                            try {
                                                await api.admin.deleteUser(userId);
                                                setUsers(users.filter(u => u.id !== userId));
                                                Alert.alert("Success", `User "${username}" has been deleted.`);
                                            } catch (err: any) {
                                                Alert.alert("Error", err.message || "Failed to delete user");
                                            }
                                        },
                                    },
                                ]
                            );
                        } else {
                            performDelete();
                        }
                    },
                },
            ]
        );

        const performDelete = async () => {
            try {
                await api.admin.deleteUser(userId);
                setUsers(users.filter(u => u.id !== userId));
                Alert.alert("Success", `User "${username}" has been deleted.`);
            } catch (err: any) {
                Alert.alert("Error", err.message || "Failed to delete user");
            }
        };
    };

    const getRoleBadgeStyle = (roleId: number) => {
        if (roleId === 1) {
            return { bg: styles.adminBadge, text: styles.adminText, label: "Admin" };
        }
        if (roleId === 3) {
            return { bg: styles.modBadge, text: styles.modText, label: "Moderator" };
        }
        return { bg: styles.userBadge, text: styles.userText, label: "User" };
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <Header title="Kelola User" />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#dc2626" />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header title="Kelola User" />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
                        <Text style={styles.retryButtonText}>Coba lagi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const displayedUsers = users.slice(0, displayCount);

    return (
        <View style={styles.container}>
            <Header title="Kelola User" />
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#dc2626"]}
                        tintColor="#dc2626"
                    />
                }
            >
                <View style={styles.headerInfo}>
                    <Text style={styles.totalText}>Total: {users.length} users</Text>
                </View>

                {displayedUsers.map((user) => {
                    const badge = getRoleBadgeStyle(user.role_id);
                    const isAdmin = user.role_id === 1;
                    const isModerator = user.role_id === 3;
                    const isRegularUser = user.role_id === 2;

                    return (
                        <View key={user.id} style={styles.userCard}>
                            <View style={styles.userHeader}>
                                <Text style={styles.username}>{user.username}</Text>
                                <View style={[styles.roleBadge, badge.bg]}>
                                    <Text style={[styles.roleText, badge.text]}>{badge.label}</Text>
                                </View>
                            </View>
                            <View style={styles.userDetails}>
                                <Text style={styles.detailText}>ID: {user.id}</Text>
                                <Text style={styles.detailText}>Resep: {user.recipe_count}</Text>
                                <Text style={styles.detailText}>
                                    Bergabung: {new Date(user.created_at).toLocaleDateString()}
                                </Text>
                            </View>

                            {/* Action Buttons */}
                            {!isAdmin && (
                                <View style={styles.actionButtons}>
                                    {isRegularUser && (
                                        <TouchableOpacity
                                            style={styles.promoteButton}
                                            onPress={() => promoteUser(user.id, user.username)}
                                        >
                                            <Text style={styles.promoteButtonText}>↑ Promote</Text>
                                        </TouchableOpacity>
                                    )}

                                    {isModerator && (
                                        <TouchableOpacity
                                            style={styles.demoteButton}
                                            onPress={() => demoteUser(user.id, user.username)}
                                        >
                                            <Text style={styles.demoteButtonText}>↓ Demote</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => deleteUser(user.id, user.username, user.recipe_count)}
                                    >
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {isAdmin && (
                                <View style={styles.protectedBadge}>
                                    <Text style={styles.protectedText}>🛡️ Protected</Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                <LoadMoreButton
                    currentItems={displayCount}
                    totalItems={users.length}
                    onLoadMore={handleLoadMore}
                    itemsPerPage={itemsPerPage}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    headerInfo: {
        backgroundColor: "#dbeafe",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    totalText: {
        color: "#1e40af",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    userCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    username: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
        flex: 1,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    adminBadge: {
        backgroundColor: "#fee2e2",
    },
    modBadge: {
        backgroundColor: "#dbeafe",
    },
    userBadge: {
        backgroundColor: "#f3f4f6",
    },
    roleText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    adminText: {
        color: "#b91c1c",
    },
    modText: {
        color: "#1e40af",
    },
    userText: {
        color: "#6b7280",
    },
    userDetails: {
        gap: 4,
        marginBottom: 12,
    },
    detailText: {
        fontSize: 13,
        color: "#6b7280",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },
    promoteButton: {
        flex: 1,
        backgroundColor: "#dbeafe",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    promoteButtonText: {
        color: "#1e40af",
        fontWeight: "600",
        fontSize: 14,
    },
    demoteButton: {
        flex: 1,
        backgroundColor: "#fed7aa",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    demoteButtonText: {
        color: "#9a3412",
        fontWeight: "600",
        fontSize: 14,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: "#fee2e2",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteButtonText: {
        color: "#dc2626",
        fontWeight: "600",
        fontSize: 14,
    },
    protectedBadge: {
        marginTop: 8,
        padding: 8,
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
        alignItems: "center",
    },
    protectedText: {
        fontSize: 13,
        color: "#6b7280",
        fontStyle: "italic",
    },
    errorText: {
        color: "#dc2626",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#dc2626",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});

export default AdminUsersScreen;
