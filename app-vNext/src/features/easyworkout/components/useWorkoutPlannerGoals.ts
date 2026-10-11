import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { subscribeToWorkoutGoals } from "@/lib/firestore/workoutGoals";
import { workoutGoalDemoFixtures } from "@/features/easyworkout/demo/workoutGoalDemoFixtures";
import type { WorkoutGoal } from "@/features/easyworkout/domain/workoutGoals";
export function useWorkoutPlannerGoals() {
  const { user, isDemoMode } = useAuth();
  const [goals,setGoals] = useState<WorkoutGoal[]>([]);
  const [loading,setLoading] = useState(true);
  const [warning,setWarning] = useState("");
  useEffect(()=>{
    setGoals([]);setWarning("");
    if(isDemoMode){setGoals(workoutGoalDemoFixtures);setLoading(false);return;}
    if(!user){setLoading(false);setWarning("Saved goals are unavailable while signed out.");return;}
    setLoading(true);
    return subscribeToWorkoutGoals(user.uid,records=>{setGoals(records);setLoading(false);},()=>{setLoading(false);setWarning("Saved goals could not be read. Planning uses available workout history only.");});
  },[user?.uid,isDemoMode]);
  return {goals,loading,warning};
}
