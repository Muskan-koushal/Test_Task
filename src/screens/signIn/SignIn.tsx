import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CommonInput from "../../commonComponents/CommonInput";
import type { RootStackParamList } from "../../navigation/types";
import {
  getRegisteredUser,
  saveSession,
} from "../../utils/authStorage";

type SignInFormValues = {
  email: string;
  password: string;
};

const SignIn = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values: SignInFormValues) => {
    const email = values.email.trim().toLowerCase();
    try {
      const registeredUser = await getRegisteredUser();
      const user = {
        fullName:
          registeredUser?.email === email
            ? registeredUser.fullName
            : email.split("@")[0],
        email,
      };
      await saveSession(user);
      navigation.reset({ index: 0, routes: [{ name: "Home", params: { user } }] });
    } catch (error) {
      Alert.alert(
        "Unable to sign in",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heading}>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Enter your account details.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email is required.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address.",
              },
            }}
            render={({ field: { onBlur, onChange, value } }) => (
              <CommonInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Enter your email"
                returnKeyType="next"
                style={errors.email ? styles.inputError : undefined}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text style={styles.error}>{errors.email.message}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <Controller
            control={control}
            name="password"
            rules={{ required: "Password is required." }}
            render={({ field: { onBlur, onChange, value } }) => (
              <CommonInput
                autoCapitalize="none"
                autoComplete="current-password"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Enter your password"
                returnKeyType="done"
                secureTextEntry={!isPasswordVisible}
                style={errors.password ? styles.inputError : undefined}
                value={value}
              />
            )}
          />
          {errors.password && (
            <Text style={styles.error}>{errors.password.message}</Text>
          )}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setIsPasswordVisible(visible => !visible)}
            style={styles.visibilityButton}
          >
            <Text style={styles.visibilityText}>
              {isPasswordVisible ? "Hide password" : "Show password"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => handleSubmit(onSubmit)()}
          style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Text>
        </TouchableOpacity>

        <View style={styles.signupPrompt}>
          <Text style={styles.promptText}>Don't have an account? </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.linkText}>Create account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F9FAFB",
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  heading: {
    marginBottom: 28,
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 16,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputError: {
    borderColor: "#DC2626",
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 6,
  },
  visibilityButton: {
    alignSelf: "flex-end",
    paddingTop: 8,
  },
  visibilityText: {
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 50,
  },
  submitDisabled: {
    opacity: 0.65,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signupPrompt: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  promptText: {
    color: "#6B7280",
    fontSize: 14,
  },
  linkText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SignIn;