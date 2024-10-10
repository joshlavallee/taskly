import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Pressable,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { theme } from "../theme";

type ShoppingListItemProps = {
  name: string;
  onToggleComplete: () => void;
  onDelete: () => void;
  isCompleted?: boolean;
};

export function ShoppingListItem({
  name,
  onToggleComplete,
  onDelete,
  isCompleted,
}: ShoppingListItemProps) {
  const handleDelete = () => {
    Alert.alert(
      `Are you sure you want to delete ${name}?`,
      "It will be gone for good",
      [
        {
          text: "Yes",
          onPress: onDelete,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };
  return (
    <Pressable
      style={[
        styles.itemContainer,
        isCompleted ? styles.completedContainer : null,
      ]}
      hitSlop={20}
      onPress={onToggleComplete}
    >
      <View style={styles.row}>
        <Feather
          name={isCompleted ? "check-circle" : "circle"}
          size={24}
          color={isCompleted ? theme.colorGreen : theme.colorCerulean}
        />
        <Text
          numberOfLines={1}
          style={[styles.itemText, isCompleted ? styles.completedText : null]}
        >
          {name}
        </Text>
      </View>
      <TouchableOpacity activeOpacity={0.8} onPress={handleDelete}>
        <Feather
          name="x-circle"
          size={24}
          color={isCompleted ? theme.colorGrey : theme.colorRed}
        />
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colorCerulean,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  completedContainer: {
    backgroundColor: theme.colorLightGrey,
    borderBottomColor: theme.colorLightGrey,
  },
  itemText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "200",
  },
  completedText: {
    textDecorationLine: "line-through",
    textDecorationColor: theme.colorGrey,
    color: theme.colorGrey,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
});
