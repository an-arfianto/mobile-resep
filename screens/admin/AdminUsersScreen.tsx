import React, { useState, useCallback, useMemo } from "react";
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

type SortColumn = "created_at" | "role_id";
type SortDirection = "asc" | "desc";

const AdminUsersScreen: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayCount, setDisplayCount] = useState(15);
    const itemsPerPage = 2;

    // Sorting state
    const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.admin.getUsers();
            setUsers(response.data);
            setDisplayCount(2);
        } catch (err: any) {
            console.error("Error", err);
            setError(err.message || "User tidak tersedia");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUsers();
        }, []),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchUsers();
        setRefreshing(false);
    }, []);

    const handleLoadMore = () => {
        setDisplayCount((prev) => Math.min(prev + itemsPerPage, users.length));
    };

    // Sorting function
    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
        setDisplayCount(10);
    };

    // Sorted users
    const sortedUsers = useMemo(() => {
        const sorted = [...users];

        sorted.sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            // Handle null/undefined
            if (aVal === null || aVal === undefined) aVal = 0;
            if (bVal === null || bVal === undefined) bVal = 0;

            // Handle tanggal bergabung
            if (sortColumn === "created_at") {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            // Sort logic
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [users, sortColumn, sortDirection]);

    const promoteUser = (userId: number, username: string) => {
        Alert.alert("Promosi", `Promosikan ${username} ke Moderator?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Promosi",
                onPress: async () => {
                    try {
                        await api.admin.promoteUser(userId);
                        Alert.alert("Sukses", `${username} berhasil dipromosikan`);
                        await fetchUsers();
                    } catch (err: any) {
                        Alert.alert("Eror", err.message || "User gagal dipromosikan");
                    }
                },
            },
        ]);
    };

    const demoteUser = (userId: number, username: string) => {
        Alert.alert("Turunkan ke Reguler User", `Turunkan ${username} ke Reguler User?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Turun",
                onPress: async () => {
                    try {
                        await api.admin.demoteUser(userId);
                        Alert.alert("Sukses", `${username} berhasil diturunkan.`);
                        await fetchUsers();
                    } catch (err: any) {
                        Alert.alert("Eror", err.message || "User gagal diturunkan");
                    }
                },
            },
        ]);
    };

    const deleteUser = (userId: number, username: string, recipeCount: number) => {
        const recipeWarning =
            recipeCount > 0
                ? `\n\nPERHATIAN: Menghapus user juga akan menghapus ${recipeCount} resep yang mereka buat`
                : "";

        Alert.alert("Hapus User", `Anda yakin ingin menghapus "${username}"?${recipeWarning}`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus",
                style: "destructive",
                onPress: () => {
                    if (recipeCount > 0) {
                        Alert.alert(
                            "Konfirmasi",
                            `Hapus "${username}" dan ${recipeCount} resep mereka?`,
                            [
                                { text: "Batal", style: "cancel" },
                                {
                                    text: "Hapus",
                                    style: "destructive",
                                    onPress: async () => {
                                        try {
                                            await api.admin.deleteUser(userId);
                                            setUsers(users.filter((u) => u.id !== userId));
                                            Alert.alert(
                                                "Sukses",
                                                `User "${username}" berhasil dihapus`,
                                            );
                                        } catch (err: any) {
                                            Alert.alert(
                                                "Eror",
                                                err.message || "User gagal dihapus",
                                            );
                                        }
                                    },
                                },
                            ],
                        );
                    } else {
                        performDelete();
                    }
                },
            },
        ]);

        const performDelete = async () => {
            try {
                await api.admin.deleteUser(userId);
                setUsers(users.filter((u) => u.id !== userId));
                Alert.alert("Sukses", `User "${username}" berhasil dihapus`);
            } catch (err: any) {
                Alert.alert("Eror", err.message || "User gagal dihapus");
            }
        };
    };

    const getRoleBadgeStyle = (roleId: number) => {
        if (roleId === 1) {
            return { bg: styles.adminBadge, text: styles.adminText, label: "Admin" };
        }
        if (roleId === 2) {
            return { bg: styles.modBadge, text: styles.modText, label: "Moderator" };
        }
        return { bg: styles.userBadge, text: styles.userText, label: "User" };
    };

    const getSortIcon = (column: SortColumn) => {
        if (sortColumn === column) {
            return sortDirection === "asc" ? "↑" : "↓";
        }
        return "↕";
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <Header title="Kelola User" />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#00796b" />
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const displayedUsers = sortedUsers.slice(0, displayCount);

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
                        colors={["#00796b"]}
                        tintColor="#00796b"
                    />
                }
            >
                <View style={styles.headerInfo}>
                    <Text style={styles.totalText}>Total: {users.length} users</Text>
                </View>

                <View style={styles.sortContainer}>
                    <Text style={styles.sortLabel}>Urutkan:</Text>
                    <TouchableOpacity
                        style={[
                            styles.sortButton,
                            sortColumn === "created_at" && styles.sortButtonActive,
                        ]}
                        onPress={() => handleSort("created_at")}
                    >
                        <Text
                            style={[
                                styles.sortButtonText,
                                sortColumn === "created_at" && styles.sortButtonTextActive,
                            ]}
                        >
                            Bergabung {getSortIcon("created_at")}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.sortButton,
                            sortColumn === "role_id" && styles.sortButtonActive,
                        ]}
                        onPress={() => handleSort("role_id")}
                    >
                        <Text
                            style={[
                                styles.sortButtonText,
                                sortColumn === "role_id" && styles.sortButtonTextActive,
                            ]}
                        >
                            Role {getSortIcon("role_id")}
                        </Text>
                    </TouchableOpacity>
                </View>

                {displayedUsers.map((user) => {
                    const badge = getRoleBadgeStyle(user.role_id);
                    const isAdmin = user.role_id === 1;
                    const isModerator = user.role_id === 2;
                    const isRegularUser = user.role_id === 3;

                    return (
                        <View key={user.id} style={styles.userCard}>
                            <View style={styles.userHeader}>
                                <Text style={styles.username}>{user.username}</Text>
                                <View style={[styles.roleBadge, badge.bg]}>
                                    <Text style={[styles.roleText, badge.text]}>{badge.label}</Text>
                                </View>
                            </View>
                            <View style={styles.userDetails}>
                                <Text style={styles.detailText}>Resep: {user.recipe_count}</Text>
                                <Text style={styles.detailText}>
                                    Bergabung: {formatDate(user.created_at)}
                                </Text>
                            </View>

                            {!isAdmin && (
                                <View style={styles.actionButtons}>
                                    {isRegularUser && (
                                        <TouchableOpacity
                                            style={styles.promoteButton}
                                            onPress={() => promoteUser(user.id, user.username)}
                                        >
                                            <Text style={styles.promoteButtonText}>Promosi</Text>
                                        </TouchableOpacity>
                                    )}

                                    {isModerator && (
                                        <TouchableOpacity
                                            style={styles.demoteButton}
                                            onPress={() => demoteUser(user.id, user.username)}
                                        >
                                            <Text style={styles.demoteButtonText}>Turun</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() =>
                                            deleteUser(user.id, user.username, user.recipe_count)
                                        }
                                    >
                                        <Text style={styles.deleteButtonText}>Hapus</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {isAdmin && (
                                <View style={styles.protectedBadge}>
                                    <Text style={styles.protectedText}> Protected </Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                <LoadMoreButton
                    currentItems={displayCount}
                    totalItems={sortedUsers.length}
                    onLoadMore={handleLoadMore}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f5d7",
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
        marginBottom: 12,
    },
    totalText: {
        color: "#1e40af",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    sortContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sortLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
    sortButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#f3f4f6",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    sortButtonActive: {
        backgroundColor: "#00796b",
        borderColor: "#00796b",
    },
    sortButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
    },
    sortButtonTextActive: {
        color: "#fff",
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
        backgroundColor: "#f3e8ff",
    },
    userBadge: {
        backgroundColor: "#dbeafe",
    },
    roleText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    adminText: {
        color: "#b91c1c",
    },
    modText: {
        color: "#7c3aed",
    },
    userText: {
        color: "#1e40af",
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
