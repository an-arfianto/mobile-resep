import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import api from "@/services/api";
import type { RootStackParamList, Ingredient, Recipe } from "@/types";

type EditRecipeRouteProp = RouteProp<RootStackParamList, "EditRecipe">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UNITS = [
    { label: "Berat", value: "" },
    { label: "g (gram)", value: "g" },
    { label: "kg (kilogram)", value: "kg" },
    { label: "ml (mililiter)", value: "ml" },
    { label: "l (liter)", value: "l" },
    { label: "cup (cangkir)", value: "cup" },
    { label: "sdm (sendok makan)", value: "sdm" },
    { label: "sdt (sendok teh)", value: "sdt" },
    { label: "butir", value: "butir" },
    { label: "buah", value: "buah" },
    { label: "siung", value: "siung" },
    { label: "batang", value: "batang" },
    { label: "lembar", value: "lembar" },
    { label: "potong", value: "potong" },
];

const EditRecipeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<EditRecipeRouteProp>();
    const recipeId = route.params.recipeId;

    const [loadingRecipe, setLoadingRecipe] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [instructions, setInstructions] = useState<string>("");
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { name: "", quantity: null, unit: "" },
    ]);

    useEffect(() => {
        fetchRecipe();
    }, []);

    const fetchRecipe = async () => {
        try {
            setLoadingRecipe(true);
            const response = await api.recipes.getById(recipeId);
            const recipe = response.data as Recipe;

            // Populate form
            setName(recipe.name);
            setCategory(recipe.category);
            setDescription(recipe.description || "");
            setInstructions(recipe.instructions || "");

            // Handle ingredients
            if (Array.isArray(recipe.ingredients)) {
                setIngredients(
                    recipe.ingredients.map((ing: Ingredient) => ({
                        name: ing.name,
                        quantity: ing.quantity || null,
                        unit: ing.unit || "",
                    })),
                );
            } else if (typeof recipe.ingredients === "string") {
                // Parse string format
                const parsed = recipe.ingredients.split(",").map((item: string) => ({
                    name: item.trim(),
                    quantity: null,
                    unit: "",
                }));
                setIngredients(
                    parsed.length > 0 ? parsed : [{ name: "", quantity: null, unit: "" }],
                );
            }
        } catch (err: any) {
            Alert.alert("Error", err.message, [
                { text: "Kembali", onPress: () => navigation.goBack() },
            ]);
        } finally {
            setLoadingRecipe(false);
        }
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { name: "", quantity: null, unit: "" }]);
    };

    const removeIngredient = (index: number) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter((_, i) => i !== index));
        }
    };

    const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
        const updated = [...ingredients];
        updated[index] = { ...updated[index], [field]: value };
        setIngredients(updated);
    };

    const handleSubmit = async () => {
        if (!name || !category || !instructions) {
            Alert.alert("Error", "Isi semua field yang ada!");
            return;
        }

        const validIngredients = ingredients.filter((i) => i.name.trim() !== "");

        if (validIngredients.length === 0) {
            Alert.alert("Error", "Isi minimal 1 bahan!");
            return;
        }

        try {
            setLoading(true);
            await api.recipes.update(recipeId, {
                name,
                category,
                description,
                instructions,
                ingredients: validIngredients,
            });

            Alert.alert("Success", "Resep telah diubah", [
                {
                    text: "OK",
                    onPress: () => navigation.navigate("RecipeDetail", { recipeId }),
                },
            ]);
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingRecipe) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#ef4444" />
                <Text style={styles.loadingText}>Loading resep...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView style={styles.scrollView}>
                <View style={styles.card}>
                    <Text style={styles.title}>Edit Resep</Text>

                    <Text style={styles.label}>Nama Resep *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Ayam bakar, Nasi Goreng"
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.label}>Category *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={category}
                            onValueChange={setCategory}
                            style={styles.picker}
                        >
                            <Picker.Item label="Pilih Kategori" value="" />
                            <Picker.Item label="Appetizer" value="Appetizer" />
                            <Picker.Item label="Main Course" value="Main Course" />
                            <Picker.Item label="Dessert" value="Dessert" />
                            <Picker.Item label="Beverage" value="Beverage" />
                            <Picker.Item label="Snack" value="Snack" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Deskripsi</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Jelaskan deskripsi resep"
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={3}
                    />

                    <Text style={styles.label}>Bahan *</Text>
                    {ingredients.map((ingredient, index) => (
                        <View key={index} style={styles.ingredientRow}>
                            <TextInput
                                style={[styles.input, styles.qtyInput]}
                                value={ingredient.quantity?.toString() || ""}
                                onChangeText={(text) =>
                                    updateIngredient(index, "quantity", parseInt(text) || null)
                                }
                                placeholder="Jumlah"
                                placeholderTextColor="#999"
                                keyboardType="decimal-pad"
                            />
                            <View style={[styles.pickerContainer, styles.unitPicker]}>
                                <Picker
                                    selectedValue={ingredient.unit || ""}
                                    onValueChange={(value) =>
                                        updateIngredient(index, "unit", value)
                                    }
                                    style={styles.picker}
                                >
                                    {UNITS.map((unit) => (
                                        <Picker.Item
                                            key={unit.value}
                                            label={unit.label}
                                            value={unit.value}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            <TextInput
                                style={[styles.input, styles.nameInput]}
                                value={ingredient.name}
                                onChangeText={(text) => updateIngredient(index, "name", text)}
                                placeholder="Bahan"
                                placeholderTextColor="#999"
                            />
                            {ingredients.length > 1 && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeIngredient(index)}
                                >
                                    <Text style={styles.removeButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
                        <Text style={styles.addButtonText}>+ Tambah Bahan</Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Instruksi *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={instructions}
                        onChangeText={setInstructions}
                        placeholder="Jelaskan instuksi pembuatannya (e.g., 1. 2. 3. dst)..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={6}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.cancelButtonText}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.submitButtonText}>
                                {loading ? "Mohon Tunggu..." : "Edit Resep"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        color: "#6b7280",
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    card: {
        backgroundColor: "#fff",
        margin: 16,
        padding: 16,
        borderRadius: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
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
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        marginBottom: 16,
        overflow: "hidden",
    },
    picker: {
        height: 50,
    },
    ingredientRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
        alignItems: "center",
    },
    qtyInput: {
        width: 70,
        marginBottom: 0,
    },
    unitPicker: {
        width: 100,
        marginBottom: 0,
    },
    nameInput: {
        flex: 1,
        marginBottom: 0,
    },
    removeButton: {
        backgroundColor: "#fee2e2",
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    removeButtonText: {
        color: "#dc2626",
        fontSize: 18,
        fontWeight: "bold",
    },
    addButton: {
        backgroundColor: "#f3f4f6",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 16,
    },
    addButtonText: {
        color: "#374151",
        fontWeight: "600",
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f3f4f6",
    },
    cancelButtonText: {
        color: "#374151",
        fontWeight: "600",
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: "#ef4444",
    },
    submitButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default EditRecipeScreen;
