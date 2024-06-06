import { create } from "zustand";

const useStore = create((set) => ({
    complex_id: null,
    setComplexId: (complex_id) => set({ complex_id }),
}));

export { useStore };
