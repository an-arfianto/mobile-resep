import { colors } from "@/assets/color";
import RecipeCard from "@/components/RecipeCard";
import api from "@/services/api";
import type { Recipe, SearchCriteria, SearchResponse } from "@/types";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Header from "@/components/Header";

const SearchScreen: React.FC = () => {
    const [operator, setOperator] = useState<"AND" | "OR" | "NOT">("OR");
    const [ingredientsInput, setIngredientsInput] = useState<string>("");
    const [excludedInput, setExcludedInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [searched, setSearched] = useState<boolean>(false);
    const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);

    const [ingredientsError, setIngredientsError] = useState<string>("");
    const [excludedError, setExcludedError] = useState<string>("");
    const [apiError, setApiError] = useState<string>("");

    function handleOperatorChange(op: "AND" | "OR" | "NOT") {
        setOperator(op);
        setIngredientsError("");
        setExcludedError("");
        setApiError("");
        if (op !== "NOT") {
            setExcludedInput("");
        }
    }

    const handleSearch = async () => {
        Keyboard.dismiss();

        setIngredientsError("");
        setExcludedError("");
        setApiError("");

        const ingredients = ingredientsInput
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean);

        if (ingredients.length === 0) {
            setIngredientsError("Masukan minimal 1 bahan");
            return;
        }

        const searchData: SearchCriteria = {
            operator,
            ingredients,
            excludedIngredients: [],
        };

        if (operator === "NOT") {
            const excluded = excludedInput
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean);

            if (excluded.length === 0) {
                setExcludedError("Masukan bahan yang tidak diinginkan saat menggunakan NOT");
                return;
            }
            searchData.excludedIngredients = excluded;
        }

        try {
            setLoading(true);
            const result = await api.recipes.search(searchData);
            setSearchResult(result);
            setSearched(true);
        } catch (err: unknown) {
            const message =
                typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message: unknown }).message)
                    : "Terjadi kesalahan";
            setApiError(message);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = useCallback(
        ({ item }: { item: Recipe }) => <RecipeCard recipe={item} />,
        [],
    );

    const results: Recipe[] = searched && searchResult ? searchResult.data : [];

    return (
        <View style={styles.container}>
            <Header title="Cari Resep" />

            <View style={styles.formContainer}>
                <Text style={styles.title}>Pencarian Resep Boolean Retrieval</Text>

                <Text style={styles.label}>Operator Pencarian</Text>
                <View style={styles.operatorContainer}>
                    {(["OR", "AND", "NOT"] as const).map((op) => (
                        <TouchableOpacity
                            key={op}
                            style={[
                                styles.operatorButton,
                                operator === op && styles.operatorButtonActive,
                            ]}
                            onPress={() => handleOperatorChange(op)}
                        >
                            <Text
                                style={[
                                    styles.operatorText,
                                    operator === op && styles.operatorTextActive,
                                ]}
                            >
                                {op}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Bahan (Gunakan koma sebagai pemisah antar bahan)</Text>
                <TextInput
                    style={[styles.input, !!ingredientsError && styles.inputError]}
                    value={ingredientsInput}
                    onChangeText={(v) => {
                        setIngredientsInput(v);
                        setIngredientsError("");
                    }}
                    placeholder="e.g., ayam, nasi, kecap"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                />
                {!!ingredientsError && <Text style={styles.errorText}>{ingredientsError}</Text>}

                {operator === "NOT" && (
                    <>
                        <Text style={styles.label}>Bahan yang tidak diinginkan</Text>
                        <TextInput
                            style={[styles.input, !!excludedError && styles.inputError]}
                            value={excludedInput}
                            onChangeText={(v) => {
                                setExcludedInput(v);
                                setExcludedError("");
                            }}
                            placeholder="e.g., babi, cabai, wine"
                            placeholderTextColor={colors.textMuted}
                            returnKeyType="search"
                            onSubmitEditing={handleSearch}
                        />
                        {!!excludedError && <Text style={styles.errorText}>{excludedError}</Text>}
                    </>
                )}

                {!!apiError && (
                    <View style={styles.apiErrorContainer}>
                        <Text style={styles.errorText}>{apiError}</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.searchButton, loading && { opacity: 0.7 }]}
                    onPress={handleSearch}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.textInverse} />
                    ) : (
                        <Text style={styles.searchButtonText}>Cari Resep</Text>
                    )}
                </TouchableOpacity>
            </View>

            {searched && searchResult && (
                <View style={styles.resultCard}>
                    <Text style={styles.resultText}>
                        Ditemukan <Text style={styles.bold}>{searchResult.count}</Text> resep
                        menggunakan <Text style={styles.bold}>{searchResult.operator}</Text>{" "}
                        operator
                    </Text>
                    <Text style={styles.resultDetail}>
                        Bahan: {searchResult.searchedIngredients.join(", ")}
                    </Text>
                    {searchResult.excludedIngredients &&
                        searchResult.excludedIngredients.length > 0 && (
                            <Text style={styles.resultDetail}>
                                Dikecualikan: {searchResult.excludedIngredients.join(", ")}
                            </Text>
                        )}
                </View>
            )}

            {searched && (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        !loading ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    Resep tidak ditemukan. Coba dengan bahan yang lain.
                                </Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={
                        results.length > 0 ? (
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>
                                    {results.length} resep ditemukan
                                </Text>
                            </View>
                        ) : null
                    }
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    formContainer: {
        backgroundColor: colors.surface,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: 8,
    },
    operatorContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
    },
    operatorButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: colors.overlay,
        alignItems: "center",
    },
    operatorButtonActive: {
        backgroundColor: colors.primary,
    },
    operatorText: {
        color: colors.textPrimary,
        fontWeight: "600",
    },
    operatorTextActive: {
        color: colors.textInverse,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 4,
        backgroundColor: colors.inputBackground,
        color: colors.textPrimary,
    },
    inputError: {
        borderColor: colors.error,
        marginBottom: 2,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
    },
    apiErrorContainer: {
        backgroundColor: colors.errorSoft,
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    searchButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 4,
    },
    searchButtonText: {
        color: colors.textInverse,
        fontWeight: "bold",
        fontSize: 16,
    },
    resultCard: {
        backgroundColor: colors.secondarySoft,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    resultText: {
        fontSize: 14,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    resultDetail: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    bold: {
        fontWeight: "bold",
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    emptyText: {
        textAlign: "center",
        color: colors.textPrimary,
        fontSize: 15,
    },
    footer: {
        alignItems: "center",
        paddingVertical: 16,
    },
    footerText: {
        fontSize: 13,
        color: colors.textMuted,
    },
});

export default SearchScreen;
