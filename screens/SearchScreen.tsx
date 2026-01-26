import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import RecipeCard from "@/components/RecipeCard";
import api from "@/services/api";
import type { Recipe, SearchCriteria, SearchResponse } from "@/types";
import Header from "../components/Header";

const SearchScreen: React.FC = () => {
    const [operator, setOperator] = useState<"AND" | "OR" | "NOT">("OR");
    const [ingredientsInput, setIngredientsInput] = useState<string>("");
    const [excludedInput, setExcludedInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [searched, setSearched] = useState<boolean>(false);
    const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);

    const handleSearch = async () => {
        const ingredients = ingredientsInput
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean);

        if (ingredients.length === 0) {
            alert("Isi minimal 1 bahan");
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
                alert("Isi bahan yang tidak diinginkan saat menggunakan NOT");
                return;
            }
            searchData.excludedIngredients = excluded;
        }

        try {
            setLoading(true);
            const result = await api.recipes.search(searchData);
            setSearchResult(result);
            setSearched(true);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header title="Cari Resep" />

            <ScrollView style={styles.scrollContainer}>
                <View style={styles.searchCard}>
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
                                onPress={() => setOperator(op)}
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

                    <Text style={styles.label}>
                        Bahan (Gunakan koma sebagai pemisah antar bahan)
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={ingredientsInput}
                        onChangeText={setIngredientsInput}
                        placeholder="e.g., ayam, nasi, kecap"
                        placeholderTextColor="#999"
                    />

                    {operator === "NOT" && (
                        <>
                            <Text style={styles.label}>Bahan yang tidak diinginkan</Text>
                            <TextInput
                                style={styles.input}
                                value={excludedInput}
                                onChangeText={setExcludedInput}
                                placeholder="e.g., babi, cabai, wine"
                                placeholderTextColor="#999"
                            />
                        </>
                    )}

                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                        disabled={loading}
                    >
                        <Text style={styles.searchButtonText}>
                            {loading ? "Mohon Tunggu..." : "Cari Resep"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {searched && (
                    <View style={styles.resultsSection}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#ef4444" />
                        ) : searchResult ? (
                            <>
                                <View style={styles.resultCard}>
                                    <Text style={styles.resultTitle}>Hasil Pencarian</Text>
                                    <Text style={styles.resultText}>
                                        Ditemukan{" "}
                                        <Text style={styles.bold}>{searchResult.count}</Text> resep
                                        menggunakan{" "}
                                        <Text style={styles.bold}>{searchResult.operator}</Text>{" "}
                                        operator
                                    </Text>
                                    <Text style={styles.resultDetail}>
                                        Bahan yang diinginkan:{" "}
                                        {searchResult.searchedIngredients.join(", ")}
                                    </Text>
                                    {searchResult.excludedIngredients && (
                                        <Text style={styles.resultDetail}>
                                            Bahan yang tidak diinginkan:{" "}
                                            {searchResult.excludedIngredients.join(", ")}
                                        </Text>
                                    )}
                                </View>

                                {searchResult.count > 0 ? (
                                    searchResult.data.map((recipe) => (
                                        <RecipeCard key={recipe.id} recipe={recipe} />
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>
                                        Resep tidak ditemukan. Coba dengan bahan yang lain.
                                    </Text>
                                )}
                            </>
                        ) : null}
                    </View>
                )}
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
        padding: 16,
    },
    searchCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    operatorContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    operatorButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
    },
    operatorButtonActive: {
        backgroundColor: "#ef4444",
    },
    operatorText: {
        color: "#374151",
        fontWeight: "600",
    },
    operatorTextActive: {
        color: "#fff",
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 16,
        color: "#111",
    },
    searchButton: {
        backgroundColor: "#ef4444",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    searchButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    resultsSection: {
        marginTop: 8,
    },
    resultCard: {
        backgroundColor: "#dbeafe",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 8,
    },
    resultText: {
        fontSize: 14,
        color: "#374151",
        marginBottom: 4,
    },
    resultDetail: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 4,
    },
    bold: {
        fontWeight: "bold",
    },
    emptyText: {
        textAlign: "center",
        color: "#6b7280",
        fontSize: 16,
        marginTop: 24,
    },
});

export default SearchScreen;
