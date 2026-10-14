import { Text, TouchableOpacity } from "react-native";

const CommonButton = (text: string) => {
  return (
   <TouchableOpacity>
    <Text>{text}</Text>
   </TouchableOpacity>
  );
};

export default CommonButton;