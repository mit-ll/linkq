import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { MainStatusNameType, SubStatusNameType } from "components/LinkQStages/LinkQStages"

export type StageType = {
  mainStage: MainStatusNameType,
  subStage: SubStatusNameType,
  description?: string,
}


const initialState: StageType = {
  mainStage: "Question Refinement",
  subStage: "User asks question",
}

const stageSlice = createSlice({
  name: 'stageSlice',
  initialState,
  reducers: {
    setStage: (state: StageType, action: PayloadAction<StageType>) => {
      state.mainStage = action.payload.mainStage
      state.subStage = action.payload.subStage
      state.description = action.payload.description
    },
  }
})

export const { 
  reducer: stageSliceReducer, 
  actions: {
    setStage,
  }
} = stageSlice