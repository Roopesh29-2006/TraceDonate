import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import AdminDashboard from "../screens/AdminDashboard";
import DonorDashboard from "../screens/DonorDashboard";
import VictimDashboard from "../screens/VictimDashboard";
import CreateRequestScreen from "../screens/CreateRequestScreen";
import SubmitCompletionScreen from "../screens/SubmitCompletionScreen";
import RequestListScreen from "../screens/RequestListScreen";
import DonateScreen from "../screens/DonateScreen";
import PaymentGatewayScreen from "../screens/PaymentGatewayScreen";
import DonorTabNavigator from "./DonorTabNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  const renderDashboard = () => {
    if (!user) {
      return (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      );
    }

    if (user.role === "ADMIN") {
      return (
        <Stack.Screen
          name="Admin"
          component={AdminDashboard}
        />
      );
    }

    if (user.role === "DONOR") {
  return (
    <>
      <Stack.Screen
        name="DonorTabs"
        component={DonorTabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Donate"
        component={DonateScreen}
      />

      <Stack.Screen
        name="PaymentGateway"
        component={PaymentGatewayScreen}
      />
    </>
  );
}

    if (user.role === "VICTIM") {
      return (
        <>
          <Stack.Screen
            name="Victim"
            component={VictimDashboard}
          />
          <Stack.Screen
           name="SubmitCompletion"
            component={SubmitCompletionScreen}
            />
          <Stack.Screen
            name="CreateRequest"
            component={CreateRequestScreen}
          />
        </>
      );
    }

    return (
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {renderDashboard()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}