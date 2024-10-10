import { Tabs } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import { theme } from "../theme";

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: theme.colorCerulean }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Shopping List",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="list" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="counter"
        options={{
          title: "Counter",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Entypo name="clock" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="idea"
        options={{
          title: "Idea",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="light-bulb" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
