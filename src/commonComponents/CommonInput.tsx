import { StyleSheet, TextInput, TextInputProps } from "react-native";

const CommonInput = ({ style, placeholderTextColor, ...props }: TextInputProps) => {
  return (
    <TextInput
      {...props}
      placeholderTextColor={placeholderTextColor ?? "#6B7280"}
      style={[styles.input, style]}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

export default CommonInput;
