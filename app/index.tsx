import Mainscreen from "@/Mainscreen";
import { store } from "@/src/redux/store";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from "react-redux";

export default function Index() {
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
       <StatusBar style="light" />
      <Mainscreen />
    </Provider>
     </GestureHandlerRootView>
  );
}
