//---------------DateTime Imports----------------------
import dayjs from "dayjs";
 
// --------function to convert datetime date--------------
export const formatDate = (date?: string | number | Date) => {
  if (!date) return dayjs().format("DD-MM-YYYY HH:mm:ss");
 
  return dayjs(date, [
    "YYYY-MM-DDTHH:mm",
    "YYYY-MM-DDTHH:mm:ss",
    "YYYY-MM-DD HH:mm:ss"
  ]).format("DD-MM-YYYY");
};

// --------function to convert datetime--------------
export const formatDateTime = (date?: string | number | Date) => {
  if (!date) return dayjs().format("DD-MM-YYYY HH:mm:ss");
 
  return dayjs(date, [
    "YYYY-MM-DDTHH:mm",
    "YYYY-MM-DDTHH:mm:ss",
    "YYYY-MM-DD HH:mm:ss"
  ]).format("DD-MM-YYYY HH:mm:ss");
};