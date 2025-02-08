import { create } from 'zustand';
//这是教学
// https://zustand.docs.pmnd.rs/getting-started/introduction
//interface在另一个文件里引入 zustand的所有type都在那里
// import { CounterStore } from '@client/types/store/store.types';
//sample code: 
// must have prefix use in the component name - it's a custom hook
// export const useCounterStore = create<CounterStore>((set) => ({
//     count: 0,
//     increment: () => {
//         set((state) => ({ count: state.count + 1 }));
//     },
//     incrementAsync: async () => {
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         set((state) => ({ count: state.count + 1 }));
//     },
//     decrement: () => {
//         set((state) => ({ count: state.count - 1 }));
//     },
// }));
//这些在react的functional component里用
//const count = userCounterStore.getState().count;
//这个可以在useEffect里面用
// const setCount = () => {
//   useCounterStore.setState({ count: 1 });
// };

