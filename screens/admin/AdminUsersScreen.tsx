import { colors } from "@/assets/color";
import Header from "@/components/Header";
import api from "@/services/api";
import { formatDate } from "@/utils/recipe";
import type { User } from "@/types";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type SortColumn = "created_at" | "role_id";
type SortDirection = "asc" | "desc";
type AdminUser = User & { recipe_count: number };

const roleBadge = {
    1: { bg: colors.errorSoft, text: colors.error, label: "Admin" },
    2: { bg: colors.primarySoft, text: colors.primary, label: "User" },
} as const;

const AdminUsersScreen: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayCount, setDisplayCount] = useState(10);
    const [sortColumn, setSortColumn] = useState<SortColumn>("created_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.admin.getUsers();
            setUsers(response.data as AdminUser[]);
            setDisplayCount(10);
        } catch (err: unknown) {
            const message =
                typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message: unknown }).message)
                    : "User tidak tersedia";
            setError(message);
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

    const handleSort = useCallback((column: SortColumn) => {
        setSortColumn((prev) => {
            if (prev === column) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
            else setSortDirection("asc");
            return column;
        });
        setDisplayCount(10);
    }, []);

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            const aVal =
                sortColumn === "created_at"
                    ? new Date(a.created_at ?? 0).getTime()
                    : (a.role_id ?? 0);
            const bVal =
                sortColumn === "created_at"
                    ? new Date(b.created_at ?? 0).getTime()
                    : (b.role_id ?? 0);
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [users, sortColumn, sortDirection]);

    const displayed = sortedUsers.slice(0, displayCount);
    const hasMore = displayCount < sortedUsers.length;

    const handleSuspend = useCallback((userId: number, username: string) => {
        Alert.alert(
            "Suspend User",
            `Suspend akun ${username}? User tidak bisa login sampai di-unsuspend.`,
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Suspend",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.admin.suspendUser(userId);
                            setUsers((prev) =>
                                prev.map((u) =>
                                    u.id === userId ? { ...u, is_suspended: true } : u,
                                ),
                            );
                            Alert.alert("Sukses", `${username} berhasil disuspend`);
                        } catch (err: unknown) {
                            const message =
                                typeof err === "object" && err !== null && "message" in err
                                    ? String((err as { message: unknown }).message)
                                    : "Gagal suspend user";
                            Alert.alert("Error", message);
                        }
                    },
                },
            ],
        );
    }, []);

    const handleUnsuspend = useCallback((userId: number, username: string) => {
        Alert.alert("Aktifkan User", `Aktifkan kembali akun ${username}?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Aktifkan",
                onPress: async () => {
                    try {
                        await api.admin.unsuspendUser(userId);
                        setUsers((prev) =>
                            prev.map((u) => (u.id === userId ? { ...u, is_suspended: false } : u)),
                        );
                        Alert.alert("Sukses", `${username} berhasil diaktifkan`);
                    } catch (err: unknown) {
                        const message =
                            typeof err === "object" && err !== null && "message" in err
                                ? String((err as { message: unknown }).message)
                                : "Gagal mengaktifkan user";
                        Alert.alert("Error", message);
                    }
                },
            },
        ]);
    }, []);

    const handleDelete = useCallback((userId: number, username: string, recipeCount: number) => {
        const warning =
            recipeCount > 0 ? `\n\nPERHATIAN: ${recipeCount} resep mereka juga akan dihapus` : "";

        const performDelete = async () => {
            try {
                await api.admin.deleteUser(userId);
                setUsers((prev) => prev.filter((u) => u.id !== userId));
                Alert.alert("Sukses", `User "${username}" berhasil dihapus`);
            } catch (err: unknown) {
                const message =
                    typeof err === "object" && err !== null && "message" in err
                        ? String((err as { message: unknown }).message)
                        : "Gagal menghapus user";
                Alert.alert("Error", message);
            }
        };

        Alert.alert("Hapus User", `Anda yakin menghapus "${username}"?${warning}`, [
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
                                { text: "Hapus", style: "destructive", onPress: performDelete },
                            ],
                        );
                    } else {
                        performDelete();
                    }
                },
            },
        ]);
    }, []);

    const getSortIcon = (column: SortColumn) => {
        if (sortColumn !== column) return "↕";
        return sortDirection === "asc" ? "↑" : "↓";
    };

    const renderItem = useCallback(
        ({ item }: { item: AdminUser }) => {
            const badge = roleBadge[item.role_id as 1 | 2] ?? roleBadge[2];
            const isAdmin = item.role_id === 1;

            return (
                <View style={styles.userCard}>
                    <View style={styles.userHeader}>
                        <Text style={styles.username}>{item.username}</Text>
                        <View style={styles.badgeRow}>
                            <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                                <Text style={[styles.roleText, { color: badge.text }]}>
                                    {badge.label}
                                </Text>
                            </View>
                            {item.is_suspended ? (
                                <View style={styles.suspendedBadge}>
                                    <Text style={styles.suspendedText}>Disuspend</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    <View style={styles.userDetails}>
                        <Text style={styles.detailText}>Resep: {item.recipe_count}</Text>
                        <Text style={styles.detailText}>
                            Bergabung: {formatDate(item.created_at ?? "")}
                        </Text>
                    </View>

                    {!isAdmin ? (
                        <View style={styles.actionButtons}>
                            {item.is_suspended ? (
                                <TouchableOpacity
                                    style={styles.unsuspendButton}
                                    onPress={() => handleUnsuspend(item.id, item.username)}
                                >
                                    <Text style={styles.unsuspendButtonText}>Aktifkan</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.suspendButton}
                                    onPress={() => handleSuspend(item.id, item.username)}
                                >
                                    <Text style={styles.suspendButtonText}>Suspend</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() =>
                                    handleDelete(item.id, item.username, item.recipe_count)
                                }
                            >
                                <Text style={styles.deleteButtonText}>Hapus</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.protectedBadge}>
                            <Text style={styles.protectedText}>Protected</Text>
                        </View>
                    )}
                </View>
            );
        },
        [handleSuspend, handleUnsuspend, handleDelete],
    );

    const SortHeader = useCallback(
        () => (
            <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Urutkan:</Text>
                {(["created_at", "role_id"] as SortColumn[]).map((col) => (
                    <TouchableOpacity
                        key={col}
                        style={[styles.sortButton, sortColumn === col && styles.sortButtonActive]}
                        onPress={() => handleSort(col)}
                    >
                        <Text
                            style={[
                                styles.sortButtonText,
                                sortColumn === col && styles.sortButtonTextActive,
                            ]}
                        >
                            {col === "created_at" ? "Tanggal" : "Role"} {getSortIcon(col)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        ),
        [sortColumn, sortDirection],
    );

    const ListEmpty = () => {
        if (loading && !refreshing)
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            );
        if (error)
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
                        <Text style={styles.retryButtonText}>Coba lagi</Text>
                    </TouchableOpacity>
                </View>
            );
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada user</Text>
            </View>
        );
    };

    const ListFooter = () => {
        if (loading && !refreshing) return null;
        if (hasMore)
            return (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Memuat {displayCount} dari {sortedUsers.length} user
                    </Text>
                    <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
                </View>
            );
        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>Menampilkan semua {sortedUsers.length} user</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header title="Kelola User" />
            <FlatList
                data={displayed}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                onEndReached={() => {
                    if (hasMore) setDisplayCount((prev) => Math.min(prev + 10, sortedUsers.length));
                }}
                onEndReachedThreshold={0.3}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListHeaderComponent={<SortHeader />}
                ListEmptyComponent={<ListEmpty />}
                ListFooterComponent={<ListFooter />}
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: 16,
        flexGrow: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 60,
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
        color: colors.textPrimary,
    },
    sortButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sortButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    sortButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    sortButtonTextActive: {
        color: colors.textInverse,
    },
    userCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
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
        color: colors.textPrimary,
        flex: 1,
    },
    badgeRow: {
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    suspendedBadge: {
        backgroundColor: colors.errorSoft,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    suspendedText: {
        color: colors.error,
        fontSize: 11,
        fontWeight: "700",
    },
    userDetails: {
        gap: 4,
        marginBottom: 12,
    },
    detailText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
    },
    suspendButton: {
        flex: 1,
        backgroundColor: colors.warningSoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    suspendButtonText: {
        color: colors.warning,
        fontWeight: "600",
        fontSize: 14,
    },
    unsuspendButton: {
        flex: 1,
        backgroundColor: colors.successSoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    unsuspendButtonText: {
        color: colors.success,
        fontWeight: "600",
        fontSize: 14,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: colors.errorSoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteButtonText: {
        color: colors.error,
        fontWeight: "600",
        fontSize: 14,
    },
    protectedBadge: {
        marginTop: 8,
        padding: 8,
        backgroundColor: colors.overlay,
        borderRadius: 8,
        alignItems: "center",
    },
    protectedText: {
        fontSize: 13,
        color: colors.textMuted,
        fontStyle: "italic",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textPrimary,
        textAlign: "center",
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: colors.error,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.textInverse,
        fontWeight: "600",
        fontSize: 16,
    },
    footer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    footerText: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 4,
    },
    footerLoader: {
        marginTop: 4,
    },
});

export default AdminUsersScreen;
