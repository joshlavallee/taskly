import { useState, useEffect } from "react";
import {
  FlatList,
  Text,
  StyleSheet,
  TextInput,
  View,
  LayoutAnimation,
} from "react-native";
import { ShoppingListItem } from "../components/ShoppingListItem";
import { theme } from "../theme";
import { getFromStorage, saveToStorage } from "../utils/storage";
import * as Haptics from "expo-haptics";

const storageKey = "shopping-list";

type ShoppingItem = {
  id: string;
  name: string;
  completedAtTimeStamp?: number;
};

export default function App() {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [value, setValue] = useState<string>("");

  const handleSubmit = () => {
    if (value) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShoppingList([
        { id: new Date().toTimeString(), name: value },
        ...shoppingList,
      ]);
    }

    saveToStorage(storageKey, shoppingList);
    setValue("");
  };

  const handleToggleComplete = (id: string) => {
    const updatedShoppingList = shoppingList
      .map((item) => {
        if (item.id === id) {
          if (item.completedAtTimeStamp) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          return {
            ...item,
            completedAtTimeStamp: item.completedAtTimeStamp
              ? undefined
              : Date.now(),
          };
        }
        return item;
      })
      .sort((a, b) => {
        if (b.completedAtTimeStamp === undefined) return 1;
        if (a.completedAtTimeStamp === undefined) return -1;
        return a.completedAtTimeStamp - b.completedAtTimeStamp;
      });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(updatedShoppingList);
    saveToStorage(storageKey, updatedShoppingList);
  };

  const handleDelete = (id: string) => {
    const updatedShoppingList = shoppingList.filter((item) => item.id !== id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShoppingList(updatedShoppingList);
    saveToStorage(storageKey, updatedShoppingList);
  };

  useEffect(() => {
    const fetchInitalShoppingList = async () => {
      const data = await getFromStorage(storageKey);
      if (data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShoppingList(data);
      }
    };

    fetchInitalShoppingList();
  }, []);

  return (
    <FlatList
      data={shoppingList}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={[0]}
      renderItem={({ item }) => (
        <ShoppingListItem
          name={item.name}
          isCompleted={!!item.completedAtTimeStamp}
          onToggleComplete={() => handleToggleComplete(item.id)}
          onDelete={() => handleDelete(item.id)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>Your shopping list is empty</Text>
        </View>
      }
      ListHeaderComponent={
        <TextInput
          style={styles.textInput}
          placeholder="EX: Coffee"
          value={value}
          onChangeText={setValue}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingTop: 12,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  textInput: {
    borderColor: theme.colorLightGrey,
    borderWidth: 2,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    fontSize: 18,
    borderRadius: 50,
    backgroundColor: theme.colorWhite,
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
});
