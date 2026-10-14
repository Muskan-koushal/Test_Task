import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
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
  confirmPasswordRules,
  emailRules,
  fullNameRules,
  passwordRules,
  SignUpFormValues,
} from "../../utils/Rules";
import { saveRegisteredUser } from "../../utils/authStorage";

const SignUp = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      await saveRegisteredUser({
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
      });
      navigation.navigate("SignIn");
    } catch (error) {
      Alert.alert(
        "Unable to create account",
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Enter your details to get started.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full name</Text>
          <Controller
            control={control}
            name="fullName"
            rules={fullNameRules}
            render={({ field: { onBlur, onChange, value } }) => (
              <CommonInput
                autoCapitalize="words"
                autoComplete="name"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Enter your full name"
                returnKeyType="next"
                style={errors.fullName ? styles.inputError : undefined}
                value={value}
              />
            )}
          />
          {errors.fullName && (
            <Text style={styles.error}>{errors.fullName.message}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Controller
            control={control}
            name="email"
            rules={emailRules}
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
            rules={passwordRules}
            render={({ field: { onBlur, onChange, value } }) => (
              <CommonInput
                autoCapitalize="none"
                autoComplete="new-password"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Enter a strong password"
                returnKeyType="next"
                secureTextEntry={!isPasswordVisible}
                style={errors.password ? styles.inputError : undefined}
                value={value}
              />
            )}
          />
          {errors.password && (
            <Text style={styles.error}>{errors.password.message}</Text>
          )}
          <Text style={styles.hint}>
            At least 8 characters with uppercase and lowercase letters, a number,
            and a special character.
          </Text>
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

        <View style={styles.field}>
          <Text style={styles.label}>Confirm password</Text>
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              ...confirmPasswordRules,
              validate: value =>
                value === getValues("password") || "Passwords do not match.",
            }}
            render={({ field: { onBlur, onChange, value } }) => (
              <CommonInput
                autoCapitalize="none"
                autoComplete="new-password"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Re-enter your password"
                returnKeyType="done"
                secureTextEntry={!isPasswordVisible}
                style={
                  errors.confirmPassword ? styles.inputError : undefined
                }
                value={value}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword.message}</Text>
          )}
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => handleSubmit(onSubmit)()}
          style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Text>
        </TouchableOpacity>
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
  hint: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 18,
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
});

export default SignUp;
