import orderActivities from "./order/activities.js";
import userActivities from "./user/activities.js";

const allActivities = {
  ...orderActivities,
  ...userActivities,
};

export default allActivities;

console.log("[Activities] Total activities loaded:", Object.keys(allActivities).length);
