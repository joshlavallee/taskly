import { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { theme } from "../../theme";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Duration, intervalToDuration, isBefore } from "date-fns";
import { TimeSegment } from "../../components/TimeSegment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveToStorage } from "../../utils/storage";
import * as Haptics from "expo-haptics";
import ConfettiCannon from "react-native-confetti-cannon";

type CountdownStatus = {
  isOverdue: boolean;
  distance: Duration;
};

export type PersistedCountdownState = {
  currentNotificationId: string | undefined;
  completedAtTimeStamps: number[];
};

export const countdownStorageKey = "taskly-countdown";
const frequency = 10 * 1000;

export default function CounterScreen() {
  const confettiRef = useRef<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [countdownState, setCountdownState] =
    useState<PersistedCountdownState>();
  const [countdownStatus, setCountdownStatus] = useState<CountdownStatus>({
    isOverdue: false,
    distance: {},
  });
  const { width: screenWidth } = useWindowDimensions();

  const lastCompletedTimestamp = countdownState?.completedAtTimeStamps[0];

  const scheduleNotification = async () => {
    confettiRef?.current?.start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let pushNotificationId;
    const result = await registerForPushNotificationsAsync();

    if (result === "granted") {
      pushNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "The thing is due 👍",
          body: "This is a test notification",
          data: { data: "goes here" },
        },
        trigger: { seconds: frequency / 1000 },
      });
    } else {
      if (Device.isDevice) {
        Alert.alert(
          "Undable to schedule notification",
          "Enable the notification permission for Expo Go in settings",
        );
      }
    }

    if (countdownState?.currentNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        countdownState.currentNotificationId,
      );
    }

    const newCountdownState: PersistedCountdownState = {
      currentNotificationId: pushNotificationId,
      completedAtTimeStamps: countdownState
        ? [Date.now(), ...countdownState.completedAtTimeStamps]
        : [Date.now()],
    };

    setCountdownState(newCountdownState);
    await saveToStorage(countdownStorageKey, newCountdownState);
  };

  useEffect(() => {
    const init = async () => {
      const value = await AsyncStorage.getItem(countdownStorageKey);
      if (value) {
        setCountdownState(JSON.parse(value));
      }
      setIsLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timestamp = lastCompletedTimestamp
        ? lastCompletedTimestamp + frequency
        : Date.now();
      const isOverdue = isBefore(timestamp, Date.now());
      const distance = intervalToDuration(
        isOverdue
          ? { start: timestamp, end: Date.now() }
          : { start: Date.now(), end: timestamp },
      );
      setCountdownStatus({ isOverdue, distance });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [lastCompletedTimestamp]);

  return isLoading ? (
    <View style={styles.activityIndicatorContainer}>
      <ActivityIndicator />
    </View>
  ) : (
    <View
      style={[
        styles.container,
        countdownStatus.isOverdue ? styles.containerLate : undefined,
      ]}
    >
      {countdownStatus.isOverdue ? (
        <Text style={[styles.heading, styles.whiteText]}>
          Thing Overdue By...
        </Text>
      ) : (
        <Text style={styles.heading}>Thing Due In...</Text>
      )}
      <View style={styles.row}>
        <TimeSegment
          unit="Days"
          number={countdownStatus.distance.days ?? 0}
          textStyle={countdownStatus.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Hours"
          number={countdownStatus.distance.hours ?? 0}
          textStyle={countdownStatus.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Minutes"
          number={countdownStatus.distance.minutes ?? 0}
          textStyle={countdownStatus.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Seconds"
          number={countdownStatus.distance.seconds ?? 0}
          textStyle={countdownStatus.isOverdue ? styles.whiteText : undefined}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={scheduleNotification}
      >
        <Text style={styles.buttonText}>
          {countdownStatus.isOverdue
            ? "I've done the thing!"
            : "Schedule Notification"}
        </Text>
      </TouchableOpacity>
      <ConfettiCannon
        ref={confettiRef}
        count={100}
        origin={{
          x: screenWidth / 2,
          y: -20,
        }}
        autoStart={false}
        fadeOut
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  containerLate: {
    backgroundColor: theme.colorRed,
  },
  activityIndicatorContainer: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  whiteText: {
    color: theme.colorWhite,
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: theme.colorWhite,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 24,
  },
});
