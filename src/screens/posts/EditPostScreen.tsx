import { useRoute, type RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../navigation/types";
import PostFormScreen from "./PostFormScreen";

const EditPostScreen = () => {
  const { params } = useRoute<RouteProp<RootStackParamList, "EditPost">>();
  return <PostFormScreen existingPost={params.post} />;
};

export default EditPostScreen;
