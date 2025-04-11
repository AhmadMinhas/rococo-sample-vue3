import dayjs from "dayjs";

// This function takes a date string and returns a formatted date string
export const formatDateAndTime = (value) => {
  return value ? dayjs(value).format("DD MMM YYYY, HH:mm:ss") : "N/A";
};
