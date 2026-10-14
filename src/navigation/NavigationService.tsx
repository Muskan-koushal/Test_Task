import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/home/HomeScreen";
import PostDetailsScreen from "../screens/home/PostDetailsScreen";
import CreatePostScreen from "../screens/posts/CreatePostScreen";
import EditPostScreen from "../screens/posts/EditPostScreen";
import SignIn from "../screens/signIn/SignIn";
import SignUp from "../screens/signUp/SignUp";
import type { AuthUser } from "../utils/authStorage";
import type { RootStackParamList } from "./types";

export type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

type NavigationServiceProps = {
  initialUser: AuthUser | null;
};

const NavigationService = ({ initialUser }: NavigationServiceProps) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialUser ? "Home" : "SignUp"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen component={SignIn} name="SignIn" />
        <Stack.Screen component={SignUp} name="SignUp" />
        <Stack.Screen
          component={HomeScreen}
          initialParams={initialUser ? { user: initialUser } : undefined}
          name="Home"
        />
        <Stack.Screen
          component={PostDetailsScreen}
          name="PostDetails"
          options={{ headerShown: true, title: "Post details" }}
        />
        <Stack.Screen
          component={CreatePostScreen}
          name="CreatePost"
          options={{ headerShown: true, title: "Create post" }}
        />
        <Stack.Screen
          component={EditPostScreen}
          name="EditPost"
          options={{ headerShown: true, title: "Edit post" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationService;
