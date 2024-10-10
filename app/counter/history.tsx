import { useState, useEffect } from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import { countdownStorageKey, PersistedCountdownState } from "../counter";
import { getFromStorage } from "../../utils/storage";
import { format } from "date-fns";
import { theme } from "../../theme";

const fullDateFormat = `LLL d yyyy, h:mm aaa`;

export default function HistoryScreen() {
  const [countdownState, setCountdownState] =
    useState<PersistedCountdownState>();

  useEffect(() => {
    const init = async () => {
      const value = await getFromStorage(countdownStorageKey);
      setCountdownState(value);
    };

    init();
  }, []);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
      data={countdownState?.completedAtTimeStamps}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>
            {format(item, fullDateFormat)}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>No History</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    marginTop: 8,
  },
  list: {
    flex: 1,
    backgroundColor: theme.colorWhite,
  },
  listItem: {
    backgroundColor: theme.colorLightGrey,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 18,
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
});
