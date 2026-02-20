import { colors } from "@/assets/color";
import api from "@/services/api";
import type { Ingredient, RootStackParamList } from "@/types";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

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
    { label: "jumput", value: "jumput" },
    { label: "secukupnya", value: "secukupnya" },
];

const CreateRecipeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [loading, setLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [instructions, setInstructions] = useState<string>("");
    const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", quantity: null, unit: "" }]);

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
            const result = await api.recipes.create({
                name,
                category,
                description,
                instructions,
                ingredients: validIngredients,
            });

            const recipeData = result.data as any;
            Alert.alert("Success", "Resep telah ditambah!", [
                {
                    text: "OK",
                    onPress: () => navigation.navigate("RecipeDetail", { recipeId: recipeData.id }),
                },
            ]);
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.card}>
                    <Text style={styles.title}>Tambah Resep Baru</Text>

                    <Text style={styles.label}>Nama Resep *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Ayam bakar, Nasi Goreng..."
                        placeholderTextColor={colors.textMuted}
                    />

                    <Text style={styles.label}>Kategori *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
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
                        placeholderTextColor={colors.textMuted}
                        multiline
                        numberOfLines={3}
                    />

                    <Text style={styles.label}>Bahan *</Text>
                    {ingredients.map((ingredient, index) => (
                        <View key={index} style={styles.ingredientRow}>
                            <TextInput
                                style={[styles.input, styles.qtyInput]}
                                value={ingredient.quantity?.toString() || ""}
                                onChangeText={(text) => updateIngredient(index, "quantity", text)}
                                placeholder="Jumlah"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="decimal-pad"
                            />
                            <View style={[styles.pickerContainer, styles.unitPicker]}>
                                <Picker
                                    selectedValue={ingredient.unit || ""}
                                    onValueChange={(value) => updateIngredient(index, "unit", value)}
                                    style={styles.picker}
                                >
                                    {UNITS.map((unit) => (
                                        <Picker.Item key={unit.value} label={unit.label} value={unit.value} />
                                    ))}
                                </Picker>
                            </View>
                            <TextInput
                                style={[styles.input, styles.nameInput]}
                                value={ingredient.name}
                                onChangeText={(text) => updateIngredient(index, "name", text)}
                                placeholder="Nama Bahan"
                                placeholderTextColor={colors.textMuted}
                            />
                            {ingredients.length > 1 && (
                                <TouchableOpacity style={styles.removeButton} onPress={() => removeIngredient(index)}>
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
                        placeholderTextColor={colors.textMuted}
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
                            <Text style={styles.submitButtonText}>{loading ? "Mohon Tunggu..." : "Tambah Resep"}</Text>
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
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    card: {
        backgroundColor: colors.surface,
        margin: 16,
        padding: 12,
        borderRadius: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        marginBottom: 16,
        color: colors.textPrimary,
        backgroundColor: colors.inputBackground,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: colors.inputBackground,
        overflow: "hidden",
    },
    picker: {
        height: 50,
        color: colors.textPrimary,
    },
    ingredientRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
        alignItems: "center",
    },
    qtyInput: {
        width: 80,
        marginBottom: 0,
    },
    unitPicker: {
        width: 110,
        marginBottom: 0,
    },
    nameInput: {
        flex: 1,
        marginBottom: 0,
    },
    removeButton: {
        backgroundColor: colors.errorSoft,
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    removeButtonText: {
        color: colors.error,
        fontSize: 18,
        fontWeight: "bold",
    },
    addButton: {
        backgroundColor: colors.successSoft,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 16,
    },
    addButtonText: {
        color: colors.success,
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
        backgroundColor: colors.overlay,
    },
    cancelButtonText: {
        color: colors.textPrimary,
        fontWeight: "600",
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: colors.success,
    },
    submitButtonText: {
        color: colors.textInverse,
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default CreateRecipeScreen;
